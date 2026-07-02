/**
 * Pure filter/sort logic for the library table. Kept framework-free so it's
 * easy to reason about and could be unit-tested in isolation.
 */

import type { Game } from './types.ts';

export type WeightBucket = 'any' | 'light' | 'medium' | 'heavy';
export type LangMode = 'any' | 'ko' | 'en';
export type SortKey = 'title' | 'players' | 'time' | 'weight';
export type SortDir = 'asc' | 'desc';

export interface FilterState {
  search: string;
  players: number | null; // "we are N"
  bestOnly: boolean; // tighten player match to bestWith
  weight: WeightBucket;
  lang: LangMode;
  hideExpansions: boolean;
}

export const defaultFilters: FilterState = {
  search: '',
  players: null,
  bestOnly: false,
  weight: 'any',
  lang: 'any',
  hideExpansions: true
};

/** Weight bucket boundaries: light < 2.0, medium 2.0–3.5, heavy > 3.5. */
export function weightBucketOf(weight: number | null): WeightBucket | null {
  if (weight == null) return null;
  if (weight < 2.0) return 'light';
  if (weight <= 3.5) return 'medium';
  return 'heavy';
}

/**
 * The flagship rule. A game is "playable in" a language when the café stocks
 * an edition in that language, OR the game leans on text so lightly
 * (dependence ≤ 2) that the box language barely matters.
 */
export function playableIn(game: Game, lang: 'ko' | 'en'): boolean {
  if (game.editionLanguages.includes(lang)) return true;
  return game.languageDependence != null && game.languageDependence <= 2;
}

function matchesSearch(game: Game, needle: string): boolean {
  if (!needle) return true;
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  if (game.name.toLowerCase().includes(q)) return true;
  return game.alternateNames.some((n) => n.toLowerCase().includes(q));
}

function matchesPlayers(game: Game, state: FilterState): boolean {
  if (state.players == null) return true;
  const n = state.players;
  if (state.bestOnly) return game.bestWith.includes(n);
  return game.minPlayers <= n && n <= game.maxPlayers;
}

export function filterGames(all: Game[], state: FilterState): Game[] {
  return all.filter((g) => {
    if (state.hideExpansions && g.subtype === 'boardgameexpansion') return false;
    if (!matchesSearch(g, state.search)) return false;
    if (!matchesPlayers(g, state)) return false;
    if (state.weight !== 'any' && weightBucketOf(g.weight) !== state.weight)
      return false;
    if (state.lang !== 'any' && !playableIn(g, state.lang)) return false;
    return true;
  });
}

function compare(a: Game, b: Game, key: SortKey): number {
  switch (key) {
    case 'players':
      return a.maxPlayers - b.maxPlayers || a.minPlayers - b.minPlayers;
    case 'time':
      return a.playingTime - b.playingTime;
    case 'weight':
      // Unknown weights sort last regardless of direction.
      return (a.weight ?? Infinity) - (b.weight ?? Infinity);
    case 'title':
    default:
      return a.name.localeCompare(b.name);
  }
}

export function sortGames(list: Game[], key: SortKey, dir: SortDir): Game[] {
  const sorted = [...list].sort((a, b) => {
    let c = compare(a, b, key);
    if (dir === 'desc') c = -c;
    // Stable secondary sort by title so ties are deterministic.
    if (c === 0 && key !== 'title') c = a.name.localeCompare(b.name);
    return c;
  });
  return sorted;
}
