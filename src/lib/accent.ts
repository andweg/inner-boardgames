/**
 * Per-game accent colour. The pipeline stores the dominant colour of each cover
 * in `game.accent`; until a game has a real cover processed, we fall back to a
 * stable, warm café palette keyed off the game id so cards still feel curated.
 */

import type { Game } from './types.ts';

// Warm, saturated-but-cozy hues that sit well on the cream surfaces and read
// clearly as a card border / hover glow.
const FALLBACK_PALETTE = [
  '#c85c3c', // terracotta
  '#d89b2e', // amber
  '#5b8c5a', // moss
  '#3e7c8c', // teal-blue
  '#9c5ba0', // plum
  '#b0413e', // brick red
  '#2f8f7f', // pine
  '#c77d3e', // ochre
  '#7b6cc4', // periwinkle
  '#4c86d6' // cornflower
];

/** Deterministic id → palette index (small integer hash). */
function paletteIndex(id: number): number {
  const h = (id * 2654435761) >>> 0; // Knuth multiplicative hash
  return h % FALLBACK_PALETTE.length;
}

/** Resolve a game's accent colour, preferring the pipeline value. */
export function accentFor(game: Pick<Game, 'id' | 'accent'>): string {
  if (game.accent && /^#[0-9a-fA-F]{6}$/.test(game.accent)) return game.accent;
  return FALLBACK_PALETTE[paletteIndex(game.id)];
}
