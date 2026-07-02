/**
 * Central configuration for the site and the data pipeline.
 *
 * The owner fills in the placeholders below before the first run.
 * These constants are imported by both the SvelteKit app and the
 * Node scripts in `scripts/`, so keep this file dependency-free.
 */

export const siteConfig = {
  /** BGG GeekList ID that backs the library shelf. */
  geeklistId: 352945,

  /** Café name — appears in the header, <title>, and meta tags. */
  cafeName: 'Inner Circle Seoul',

  /** Public site URL (used for canonical / og:url meta). No trailing slash. */
  siteUrl: 'https://example.pages.dev',

  /** Descriptive User-Agent sent to BGG so they can identify us politely. */
  userAgent:
    'boardgame-cafe-site/1.0 (+https://github.com/OWNER/REPO) contact: owner@example.com',

  /** BGG is rate-sensitive. Pause between `thing` batches, in milliseconds. */
  requestPauseMs: 2000,

  /** Max BGG "thing" IDs per request (BGG caps this around 20). */
  thingBatchSize: 20,

  /** Backoff schedule for BGG's `202 Accepted` (queued) responses, in ms. */
  retryBackoffMs: [5000, 10000, 20000, 40000],

  /** Cover thumbnail width in px (2× a ~80px table cell). */
  coverWidth: 160
} as const;

export type SiteConfig = typeof siteConfig;
