/**
 * Cover thumbnail handling.
 *
 * We download each game's cover once, resize it with sharp, and store it as
 * WebP under static/covers/{id}.webp. Existing covers are never re-fetched,
 * and covers for games no longer on the shelf are pruned. The site serves
 * these from its own origin — we never hotlink BGG's CDN.
 */

import { existsSync } from 'node:fs';
import { mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { siteConfig } from '../../config/site.config.ts';

const COVERS_DIR = path.resolve('static/covers');

export function coverPath(id: number): string {
  return path.join(COVERS_DIR, `${id}.webp`);
}

/** Public URL the site uses to reference a cover. */
export function coverUrl(id: number): string {
  return `/covers/${id}.webp`;
}

export async function ensureCoversDir(): Promise<void> {
  await mkdir(COVERS_DIR, { recursive: true });
}

export interface CoverResult {
  id: number;
  status: 'skipped' | 'downloaded' | 'failed';
  error?: string;
}

/** Download + process one cover, unless it already exists on disk. */
export async function fetchCover(
  id: number,
  thumbnailUrl: string | null
): Promise<CoverResult> {
  const dest = coverPath(id);
  if (existsSync(dest)) return { id, status: 'skipped' };
  if (!thumbnailUrl) return { id, status: 'failed', error: 'no thumbnail URL' };

  try {
    const res = await fetch(thumbnailUrl, {
      headers: { 'User-Agent': siteConfig.userAgent }
    });
    if (!res.ok) {
      return { id, status: 'failed', error: `HTTP ${res.status}` };
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf)
      .resize({ width: siteConfig.coverWidth, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(dest);
    return { id, status: 'downloaded' };
  } catch (err) {
    return { id, status: 'failed', error: (err as Error).message };
  }
}

/** Remove cover files whose game id is no longer present in `keepIds`. */
export async function pruneCovers(keepIds: Set<number>): Promise<number[]> {
  if (!existsSync(COVERS_DIR)) return [];
  const files = await readdir(COVERS_DIR);
  const removed: number[] = [];
  for (const file of files) {
    const m = /^(\d+)\.webp$/.exec(file);
    if (!m) continue;
    const id = Number(m[1]);
    if (!keepIds.has(id)) {
      await unlink(path.join(COVERS_DIR, file));
      removed.push(id);
    }
  }
  return removed;
}
