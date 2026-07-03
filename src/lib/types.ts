/**
 * Shared data model. This is the single source of truth for the shape of
 * `data/games.json` and `data/recommendations.json`, imported by both the
 * data pipeline (`scripts/`) and the SvelteKit app (`src/`).
 */

export type Subtype = 'boardgame' | 'boardgameexpansion';

/** BGG "language dependence" poll: 1 (none) … 5 (unplayable in another language). */
export type LanguageDependence = 1 | 2 | 3 | 4 | 5;

export interface Game {
  id: number;
  name: string;
  alternateNames: string[];
  yearPublished: number | null;
  subtype: Subtype;
  minPlayers: number;
  maxPlayers: number;
  bestWith: number[];
  recommendedWith: number[];
  playingTime: number; // minutes
  minPlayTime: number;
  maxPlayTime: number;
  weight: number | null; // averageWeight, 1–5
  geekRating: number | null; // bayesAverage
  usersRated: number;
  languageDependence: LanguageDependence | null;
  languageDependenceVotes: number;
  editionLanguages: string[]; // from `lang:` tag, ISO 639-1
  ownerTags: string[]; // from `tag:` tags
  cover: string; // e.g. "/covers/174430.webp"
  accent?: string | null; // dominant cover colour, e.g. "#c85c3c" (pipeline)
}

export interface GamesFile {
  generatedAt: string; // ISO timestamp
  geeklistId: number;
  games: Game[];
}

/* ------------------------------------------------------------------ */
/* Hand-maintained recommendations                                     */
/* ------------------------------------------------------------------ */

export interface LocalizedString {
  en: string;
  ko: string;
}

export interface RecommendationKeyword {
  id: string;
  label: LocalizedString;
}

export interface RecommendationEntry {
  gameId: number;
  players: number[];
  keywords: string[];
  note?: LocalizedString;
  priority: number;
}

export interface RecommendationsFile {
  keywords: RecommendationKeyword[];
  entries: RecommendationEntry[];
}
