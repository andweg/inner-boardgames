/**
 * A small, polite BoardGameGeek client.
 *
 * BGG frequently answers heavy requests with `202 Accepted`, meaning
 * "your request is queued, ask again shortly". We retry those with a
 * fixed backoff schedule. Everything is sequential — we never hammer BGG
 * with parallel requests.
 */

import { XMLParser } from 'fast-xml-parser';
import { siteConfig } from '../../config/site.config.ts';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Elements that can appear 0..n times must always be arrays so callers
  // don't have to special-case the single-child shape fast-xml-parser gives.
  isArray: (name) =>
    ['item', 'name', 'result', 'poll', 'results', 'link'].includes(name)
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class BggError extends Error {}

interface FetchOpts {
  /** Label used in log/error messages. */
  label: string;
}

/**
 * Name of the environment variable holding the BGG API token. In CI it is
 * populated from the repository secret of the same name; locally it comes from
 * a .env file or the shell. BGG's XML API requires a Bearer token as of 2025.
 */
export const AUTH_ENV = 'BGG_API_TOKEN';

/** Read the token at call time (so a .env loaded in fetch.ts is picked up). */
function bggToken(): string | undefined {
  return process.env[AUTH_ENV]?.trim() || undefined;
}

/** Fail fast with actionable guidance if the required token is missing. */
export function assertBggAuth(): void {
  if (!bggToken()) {
    throw new BggError(
      `BGG's XML API now requires an authorization token, but ${AUTH_ENV} is not set.\n` +
        `  • In GitHub Actions it comes from the ${AUTH_ENV} repository secret.\n` +
        `  • Locally, put ${AUTH_ENV}=<your token> in a .env file (see .env.example)\n` +
        `    or export it in your shell before running \`npm run fetch\`.\n` +
        `  Register your app and create a token at https://boardgamegeek.com/using_the_xml_api`
    );
  }
}

function requestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': siteConfig.userAgent,
    Accept: 'text/xml, application/xml'
  };
  const token = bggToken();
  if (token) {
    // BGG expects `Authorization: Bearer <token>`. Tolerate a secret that
    // already includes the "Bearer " scheme so it isn't doubled up.
    headers.Authorization = /^bearer\s/i.test(token) ? token : `Bearer ${token}`;
  }
  return headers;
}

/**
 * GET a BGG XML endpoint, handling 202-queued responses with backoff.
 * Returns the parsed XML object.
 */
export async function bggGet(url: string, { label }: FetchOpts): Promise<any> {
  const maxAttempts = siteConfig.retryBackoffMs.length + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(url, { headers: requestHeaders() });

    if (res.status === 401 || res.status === 403) {
      // No point retrying an auth failure — surface it clearly.
      throw new BggError(
        `[${label}] BGG rejected the request (HTTP ${res.status}). The ${AUTH_ENV} ` +
          `token is missing, invalid, or not yet authorized for this app. ` +
          `See https://boardgamegeek.com/using_the_xml_api`
      );
    }

    if (res.status === 202) {
      // Queued. Back off and retry (unless we're out of attempts).
      const wait = siteConfig.retryBackoffMs[attempt];
      if (wait === undefined) break;
      console.log(
        `  [${label}] BGG queued (202); retrying in ${wait / 1000}s ` +
          `(attempt ${attempt + 1}/${maxAttempts})`
      );
      await sleep(wait);
      continue;
    }

    if (res.status === 429 || res.status === 503) {
      const wait = siteConfig.retryBackoffMs[attempt];
      if (wait === undefined) break;
      console.log(
        `  [${label}] BGG throttled (${res.status}); retrying in ${wait / 1000}s`
      );
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      throw new BggError(
        `[${label}] BGG returned HTTP ${res.status} ${res.statusText} for ${url}`
      );
    }

    const xml = await res.text();
    const parsed = parser.parse(xml);

    // BGG signals a bad request with an <errors> document (HTTP 200).
    if (parsed?.errors) {
      const msg =
        parsed.errors?.error?.message ?? JSON.stringify(parsed.errors);
      throw new BggError(`[${label}] BGG error: ${msg}`);
    }

    return parsed;
  }

  throw new BggError(
    `[${label}] BGG still queued/throttled after ${maxAttempts} attempts (${url}). ` +
      `Try again later.`
  );
}

export { sleep };
