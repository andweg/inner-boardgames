/**
 * Extracts the items we care about from a parsed v1 geeklist document.
 * Each geeklist item points at a BGG "thing" (a game/expansion) and carries
 * the list owner's comment in its <body>, where the café encodes tags.
 */

import { parseOwnerTags, type TagIssue } from './tags.ts';

export interface GeeklistItem {
  objectId: number;
  objectType: string; // usually "thing"
  subtype: string; // "boardgame" | "boardgameexpansion" | ...
  objectName: string; // as recorded in the geeklist (fallback for reports)
  body: string;
  editionLanguages: string[];
  ownerTags: string[];
  issues: TagIssue[];
}

function textOf(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  // fast-xml-parser may hand back an object with a #text field.
  if (typeof v === 'object' && '#text' in (v as any))
    return String((v as any)['#text'] ?? '');
  return '';
}

export function parseGeeklist(parsed: any): GeeklistItem[] {
  const list = parsed?.geeklist;
  if (!list) throw new Error('response did not contain a <geeklist> element');

  const rawItems: any[] = Array.isArray(list.item)
    ? list.item
    : list.item
      ? [list.item]
      : [];

  return rawItems.map((it) => {
    const objectId = Number(it['@_objectid']);
    const body = textOf(it.body);
    const { editionLanguages, ownerTags, issues } = parseOwnerTags(body);

    return {
      objectId,
      objectType: String(it['@_objecttype'] ?? 'thing'),
      subtype: String(it['@_subtype'] ?? 'boardgame'),
      objectName: String(it['@_objectname'] ?? `#${objectId}`),
      body,
      editionLanguages,
      ownerTags,
      issues
    };
  });
}
