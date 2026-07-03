/**
 * Motion helpers. All durations pass through here so a single
 * `prefers-reduced-motion` check disables Svelte's JS-driven transitions
 * (which, unlike CSS, aren't covered by the global reduced-motion rule).
 */

import { browser } from '$app/environment';

export const prefersReducedMotion =
  browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Duration in ms, collapsed to 0 when the user prefers reduced motion. */
export const dur = (ms: number): number => (prefersReducedMotion ? 0 : ms);

/** Per-item entrance delay, capped so large grids don't crawl in. */
export const stagger = (index: number, step = 22, cap = 320): number =>
  prefersReducedMotion ? 0 : Math.min(index * step, cap);
