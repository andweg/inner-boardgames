/**
 * Build-time data imports. The committed JSON is bundled into the prerendered
 * site; there is no runtime fetching.
 */

import gamesJson from '../../data/games.json';
import recsJson from '../../data/recommendations.json';
import type { GamesFile, RecommendationsFile } from './types.ts';

const gamesFile = gamesJson as GamesFile;
const recsFile = recsJson as RecommendationsFile;

export const games = gamesFile.games;
export const generatedAt = gamesFile.generatedAt;
export const recommendations = recsFile;

/** Valid game ids, used to skip dangling recommendation entries. */
const gameIds = new Set(games.map((g) => g.id));
export const gamesById = new Map(games.map((g) => [g.id, g]));

/** Recommendation entries whose game actually exists on the shelf. */
export const validRecEntries = recsFile.entries.filter((e) =>
  gameIds.has(e.gameId)
);
