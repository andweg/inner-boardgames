/**
 * Parses one <item> from an xmlapi2 `thing?stats=1` response into the parts
 * of our Game model that come from BGG (everything except the owner tags,
 * which are merged in from the geeklist).
 */

import type { LanguageDependence, Subtype } from '../../src/lib/types.ts';

export interface ThingData {
  id: number;
  name: string;
  alternateNames: string[];
  yearPublished: number | null;
  subtype: Subtype;
  minPlayers: number;
  maxPlayers: number;
  bestWith: number[];
  recommendedWith: number[];
  playingTime: number;
  minPlayTime: number;
  maxPlayTime: number;
  weight: number | null;
  geekRating: number | null;
  usersRated: number;
  languageDependence: LanguageDependence | null;
  languageDependenceVotes: number;
  thumbnail: string | null;
}

const attrNum = (node: any): number | null => {
  const v = node?.['@_value'];
  if (v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** "4", "4+", "10+" → 4, 4, 10. */
const playerCountOf = (raw: unknown): number | null => {
  const n = parseInt(String(raw ?? ''), 10);
  return Number.isFinite(n) ? n : null;
};

const asArray = <T>(v: T | T[] | undefined | null): T[] =>
  v == null ? [] : Array.isArray(v) ? v : [v];

function parseNames(item: any): { name: string; alternateNames: string[] } {
  const names = asArray<any>(item.name);
  let primary = '';
  const alternates: string[] = [];
  for (const n of names) {
    const value = String(n?.['@_value'] ?? '');
    if (!value) continue;
    if (n?.['@_type'] === 'primary' && !primary) primary = value;
    else alternates.push(value);
  }
  if (!primary && alternates.length) primary = alternates.shift()!;
  return { name: primary || `#${item['@_id']}`, alternateNames: alternates };
}

function parsePlayerPoll(item: any): {
  bestWith: number[];
  recommendedWith: number[];
} {
  const polls = asArray<any>(item.poll);
  const poll = polls.find((p) => p?.['@_name'] === 'suggested_numplayers');
  const bestWith: number[] = [];
  const recommendedWith: number[] = [];
  if (!poll) return { bestWith, recommendedWith };

  for (const group of asArray<any>(poll.results)) {
    const count = playerCountOf(group?.['@_numplayers']);
    if (count == null) continue;

    let best = 0;
    let rec = 0;
    let not = 0;
    for (const r of asArray<any>(group.result)) {
      const votes = Number(r?.['@_numvotes'] ?? 0) || 0;
      switch (r?.['@_value']) {
        case 'Best':
          best = votes;
          break;
        case 'Recommended':
          rec = votes;
          break;
        case 'Not Recommended':
          not = votes;
          break;
      }
    }
    if (best + rec + not === 0) continue; // no data for this count

    // A count "qualifies" for the option that won the plurality of its votes.
    if (best >= rec && best >= not && best > 0) {
      if (!bestWith.includes(count)) bestWith.push(count);
    } else if (rec >= best && rec >= not && rec > 0) {
      if (!recommendedWith.includes(count)) recommendedWith.push(count);
    }
  }

  bestWith.sort((a, b) => a - b);
  recommendedWith.sort((a, b) => a - b);
  return { bestWith, recommendedWith };
}

function parseLanguageDependence(item: any): {
  level: LanguageDependence | null;
  votes: number;
} {
  const polls = asArray<any>(item.poll);
  const poll = polls.find((p) => p?.['@_name'] === 'language_dependence');
  if (!poll) return { level: null, votes: 0 };

  const total = Number(poll?.['@_totalvotes'] ?? 0) || 0;
  if (total === 0) return { level: null, votes: 0 };

  // Results live one level down; grab them regardless of wrapper shape.
  const groups = asArray<any>(poll.results);
  const results = groups.flatMap((g) => asArray<any>(g.result));

  let bestLevel: LanguageDependence | null = null;
  let bestVotes = -1;
  for (const r of results) {
    const level = Number(r?.['@_level']);
    const votes = Number(r?.['@_numvotes'] ?? 0) || 0;
    if (level >= 1 && level <= 5 && votes > bestVotes) {
      bestVotes = votes;
      bestLevel = level as LanguageDependence;
    }
  }
  return { level: bestLevel, votes: total };
}

export function parseThing(item: any): ThingData {
  const id = Number(item['@_id']);
  const type = String(item['@_type'] ?? 'boardgame');
  const subtype: Subtype =
    type === 'boardgameexpansion' ? 'boardgameexpansion' : 'boardgame';

  const { name, alternateNames } = parseNames(item);
  const { bestWith, recommendedWith } = parsePlayerPoll(item);
  const { level: languageDependence, votes: languageDependenceVotes } =
    parseLanguageDependence(item);

  const ratings = item?.statistics?.ratings ?? {};
  const usersRated = attrNum(ratings.usersrated) ?? 0;
  const weightRaw = attrNum(ratings.averageweight);
  const bayesRaw = attrNum(ratings.bayesaverage);

  return {
    id,
    name,
    alternateNames,
    yearPublished: attrNum(item.yearpublished),
    subtype,
    minPlayers: attrNum(item.minplayers) ?? 0,
    maxPlayers: attrNum(item.maxplayers) ?? 0,
    bestWith,
    recommendedWith,
    playingTime: attrNum(item.playingtime) ?? 0,
    minPlayTime: attrNum(item.minplaytime) ?? 0,
    maxPlayTime: attrNum(item.maxplaytime) ?? 0,
    // A 0 average weight / bayes means "not enough votes" — store null.
    weight: weightRaw && weightRaw > 0 ? weightRaw : null,
    geekRating: bayesRaw && bayesRaw > 0 ? bayesRaw : null,
    usersRated,
    languageDependence,
    languageDependenceVotes,
    thumbnail: item.thumbnail ? String(item.thumbnail) : null
  };
}
