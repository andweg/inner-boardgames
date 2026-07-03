/**
 * Data pipeline entry point. Run with `npm run fetch`.
 *
 *   geeklist → parse tags → thing details → covers → games.json + report
 *
 * The script is deterministic: given the same BGG state it produces byte-identical
 * output, so a no-change run yields no git diff. It exits non-zero (committing
 * nothing) if anything fatal happens, so CI never publishes partial data.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { siteConfig } from '../config/site.config.ts';
import type {
  Game,
  GamesFile,
  RecommendationsFile
} from '../src/lib/types.ts';
import { assertBggAuth, bggGet, sleep } from './lib/bgg.ts';
import { parseGeeklist } from './lib/parse-geeklist.ts';
import { parseThing } from './lib/parse-thing.ts';
import {
  coverAccent,
  coverUrl,
  ensureCoversDir,
  fetchCover,
  pruneCovers
} from './lib/images.ts';
import { Report } from './lib/report.ts';

const GAMES_PATH = path.resolve('data/games.json');
const REPORT_PATH = path.resolve('data/fetch-report.md');
const RECS_PATH = path.resolve('data/recommendations.json');

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/**
 * Serialize a Game with a fixed key order so the JSON diff is meaningful.
 * (JSON.stringify preserves insertion order, so we build the object in order.)
 */
function orderGame(g: Game): Game {
  return {
    id: g.id,
    name: g.name,
    alternateNames: g.alternateNames,
    yearPublished: g.yearPublished,
    subtype: g.subtype,
    minPlayers: g.minPlayers,
    maxPlayers: g.maxPlayers,
    bestWith: g.bestWith,
    recommendedWith: g.recommendedWith,
    playingTime: g.playingTime,
    minPlayTime: g.minPlayTime,
    maxPlayTime: g.maxPlayTime,
    weight: g.weight,
    geekRating: g.geekRating,
    usersRated: g.usersRated,
    languageDependence: g.languageDependence,
    languageDependenceVotes: g.languageDependenceVotes,
    editionLanguages: g.editionLanguages,
    ownerTags: g.ownerTags,
    cover: g.cover,
    accent: g.accent ?? null
  };
}

async function validateRecommendations(
  gameIds: Set<number>,
  report: Report
): Promise<void> {
  if (!existsSync(RECS_PATH)) {
    report.add({
      gameId: 0,
      gameName: 'recommendations.json',
      level: 'warning',
      message: 'file not found — the recommender page will be empty'
    });
    return;
  }
  let recs: RecommendationsFile;
  try {
    recs = JSON.parse(await readFile(RECS_PATH, 'utf8'));
  } catch (err) {
    report.add({
      gameId: 0,
      gameName: 'recommendations.json',
      level: 'error',
      message: `is not valid JSON: ${(err as Error).message}`
    });
    return;
  }

  const keywordIds = new Set((recs.keywords ?? []).map((k) => k.id));
  for (const [idx, entry] of (recs.entries ?? []).entries()) {
    const label = `entry #${idx + 1} (gameId ${entry.gameId})`;
    if (!gameIds.has(entry.gameId)) {
      report.add({
        gameId: entry.gameId,
        gameName: 'recommendations.json',
        level: 'warning',
        message: `${label} references a game not on the shelf — it will be skipped`
      });
    }
    for (const kw of entry.keywords ?? []) {
      if (!keywordIds.has(kw)) {
        report.add({
          gameId: entry.gameId,
          gameName: 'recommendations.json',
          level: 'warning',
          message: `${label} uses undefined keyword "${kw}"`
        });
      }
    }
  }
}

async function main(): Promise<void> {
  // Load a local .env (token, etc.) for local runs. In CI the env comes from
  // the workflow, so a missing .env is fine.
  if (existsSync('.env')) process.loadEnvFile('.env');

  // BGG's XML API requires an authorization token — bail out early with
  // guidance rather than making a run of doomed 401 requests.
  assertBggAuth();

  const report = new Report();
  const generatedAt = new Date().toISOString();

  console.log(`Fetching geeklist ${siteConfig.geeklistId} …`);
  const geeklistXml = await bggGet(
    `https://boardgamegeek.com/xmlapi/geeklist/${siteConfig.geeklistId}`,
    { label: 'geeklist' }
  );
  const items = parseGeeklist(geeklistXml);
  // Keep only "thing" items (games/expansions); ignore anything exotic.
  const thingItems = items.filter((it) => it.objectType === 'thing');
  console.log(`  ${thingItems.length} game items found.`);

  if (thingItems.length === 0) {
    throw new Error(
      'geeklist contained no game items — refusing to overwrite games.json with nothing'
    );
  }

  // Map objectId → geeklist metadata (tags). If a game appears twice, merge.
  const tagsById = new Map<number, (typeof thingItems)[number]>();
  for (const it of thingItems) {
    const existing = tagsById.get(it.objectId);
    if (existing) {
      existing.editionLanguages = [
        ...new Set([...existing.editionLanguages, ...it.editionLanguages])
      ];
      existing.ownerTags = [
        ...new Set([...existing.ownerTags, ...it.ownerTags])
      ];
      existing.issues.push(...it.issues);
    } else {
      tagsById.set(it.objectId, { ...it });
    }
  }

  const ids = [...tagsById.keys()];

  // --- Fetch thing details in polite batches --------------------------------
  const things = new Map<number, ReturnType<typeof parseThing>>();
  const batches = chunk(ids, siteConfig.thingBatchSize);
  for (const [i, batch] of batches.entries()) {
    console.log(`Fetching details batch ${i + 1}/${batches.length} …`);
    const xml = await bggGet(
      `https://boardgamegeek.com/xmlapi2/thing?id=${batch.join(',')}&stats=1`,
      { label: `thing ${i + 1}/${batches.length}` }
    );
    const rawItems = Array.isArray(xml?.items?.item)
      ? xml.items.item
      : xml?.items?.item
        ? [xml.items.item]
        : [];
    for (const raw of rawItems) {
      const t = parseThing(raw);
      things.set(t.id, t);
    }
    if (i < batches.length - 1) await sleep(siteConfig.requestPauseMs);
  }

  // --- Merge + collect covers to fetch --------------------------------------
  await ensureCoversDir();
  const games: Game[] = [];
  let coversDownloaded = 0;
  let coversSkipped = 0;
  let coverFailures = 0;

  for (const id of ids) {
    const meta = tagsById.get(id)!;
    const t = things.get(id);

    // Merge tag-parse issues into the report.
    report.addMany(id, t?.name ?? meta.objectName, meta.issues);

    if (!t) {
      report.add({
        gameId: id,
        gameName: meta.objectName,
        level: 'error',
        message: 'BGG returned no details for this id — omitted from games.json'
      });
      continue;
    }

    const cover = await fetchCover(id, t.thumbnail);
    if (cover.status === 'downloaded') coversDownloaded++;
    else if (cover.status === 'skipped') coversSkipped++;
    else {
      coverFailures++;
      report.add({
        gameId: id,
        gameName: t.name,
        level: 'warning',
        message: `cover download failed (${cover.error}) — a placeholder tile will show`
      });
    }

    games.push(
      orderGame({
        id: t.id,
        name: t.name,
        alternateNames: t.alternateNames,
        yearPublished: t.yearPublished,
        subtype: t.subtype,
        minPlayers: t.minPlayers,
        maxPlayers: t.maxPlayers,
        bestWith: t.bestWith,
        recommendedWith: t.recommendedWith,
        playingTime: t.playingTime,
        minPlayTime: t.minPlayTime,
        maxPlayTime: t.maxPlayTime,
        weight: t.weight,
        geekRating: t.geekRating,
        usersRated: t.usersRated,
        languageDependence: t.languageDependence,
        languageDependenceVotes: t.languageDependenceVotes,
        editionLanguages: meta.editionLanguages,
        ownerTags: meta.ownerTags,
        cover: coverUrl(id),
        accent: await coverAccent(id)
      })
    );
  }

  // --- Prune stale covers ----------------------------------------------------
  const keepIds = new Set(games.map((g) => g.id));
  const pruned = await pruneCovers(keepIds);

  // --- Validate hand-maintained recommendations ------------------------------
  await validateRecommendations(keepIds, report);

  // --- Write games.json deterministically ------------------------------------
  games.sort((a, b) => a.id - b.id);
  const out: GamesFile = {
    generatedAt,
    geeklistId: siteConfig.geeklistId,
    games
  };
  await writeFile(GAMES_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');

  // --- Write the report ------------------------------------------------------
  const summary = {
    geeklistId: siteConfig.geeklistId,
    itemsInList: thingItems.length,
    gamesWritten: games.length,
    expansions: games.filter((g) => g.subtype === 'boardgameexpansion').length,
    coversDownloaded,
    coversSkipped,
    coversPruned: pruned.length,
    coverFailures
  };
  await writeFile(REPORT_PATH, report.render(summary, generatedAt), 'utf8');

  console.log(
    `\nDone: ${games.length} games, ${coversDownloaded} new covers, ` +
      `${report.warningCount} warnings, ${report.errorCount} errors.`
  );
  console.log(`See data/fetch-report.md for details.`);

  if (report.errorCount > 0) {
    throw new Error(
      `${report.errorCount} error(s) during fetch — see data/fetch-report.md. ` +
        `Exiting non-zero; no partial data was committed.`
    );
  }
}

main().catch((err) => {
  console.error('\nFETCH FAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
