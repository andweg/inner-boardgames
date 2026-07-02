/**
 * Parses the café's per-copy metadata out of a geeklist item's body text.
 *
 * Recognised tags (whitespace/comma separated, case-insensitive keys):
 *   lang:ko          → editionLanguages: ["ko"]
 *   lang:ko,ja       → editionLanguages: ["ko","ja"]   (multilingual box)
 *   tag:staff-pick   → ownerTags: ["staff-pick"]
 *
 * Validation is load-bearing: nothing here ever throws or drops a game.
 * Problems are pushed onto `issues` for the fetch report and the game
 * still comes through with whatever we could salvage.
 */

/** Full ISO 639-1 two-letter language code set, for validating `lang:`. */
const ISO_639_1 = new Set(
  (
    'aa ab ae af ak am an ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch ' +
    'co cr cs cu cv cy da de dv dz ee el en eo es et eu fa ff fi fj fo fr fy ga ' +
    'gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja ' +
    'jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv ' +
    'mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or ' +
    'os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ' +
    'ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi ' +
    'vo wa wo xh yi yo za zh zu'
  ).split(' ')
);

/**
 * Codes people commonly type by mistake — usually a country/TLD code instead
 * of the language code. `kr` is a real ISO 639-1 code (Kanuri), but for this
 * café it's virtually always a slip for Korean (`ko`), so we flag it rather
 * than silently stocking a Kanuri edition. Maps mistake → intended code.
 */
const SUSPECT_CODES: Record<string, string> = {
  kr: 'ko', // South Korea's country code, not Korean
  jp: 'ja', // Japan
  cn: 'zh', // China
  gr: 'el', // Greece
  cz: 'cs', // Czechia
  dk: 'da' // Denmark
};

export interface TagIssue {
  level: 'warning' | 'error';
  message: string;
}

export interface ParsedTags {
  editionLanguages: string[];
  ownerTags: string[];
  issues: TagIssue[];
}

export function parseOwnerTags(body: string | null | undefined): ParsedTags {
  const editionLanguages: string[] = [];
  const ownerTags: string[] = [];
  const issues: TagIssue[] = [];

  const text = (body ?? '').trim();

  // Tokens look like `key:value`. Values may themselves be comma lists.
  // We tolerate surrounding punctuation/markup from the geeklist body.
  const tokenRe = /\b(lang|tag)\s*:\s*([a-z0-9,_-]+)/gi;
  let m: RegExpExecArray | null;
  let sawLang = false;

  while ((m = tokenRe.exec(text)) !== null) {
    const key = m[1].toLowerCase();
    const rawValue = m[2];

    if (key === 'lang') {
      sawLang = true;
      for (const codeRaw of rawValue.split(',')) {
        const code = codeRaw.trim().toLowerCase();
        if (!code) continue;
        if (SUSPECT_CODES[code]) {
          issues.push({
            level: 'warning',
            message: `"lang:${code}" looks like a country code — did you mean "lang:${SUSPECT_CODES[code]}"? (ignored)`
          });
          continue;
        }
        if (!ISO_639_1.has(code)) {
          issues.push({
            level: 'warning',
            message: `unknown language code "lang:${code}" — ignored (expected ISO 639-1, e.g. ko, en, ja)`
          });
          continue;
        }
        if (!editionLanguages.includes(code)) editionLanguages.push(code);
      }
    } else if (key === 'tag') {
      const tag = rawValue.trim().toLowerCase();
      if (tag && !ownerTags.includes(tag)) ownerTags.push(tag);
    }
  }

  if (!sawLang) {
    issues.push({
      level: 'warning',
      message: 'no `lang:` tag found — game listed with unknown edition language'
    });
  } else if (editionLanguages.length === 0) {
    issues.push({
      level: 'warning',
      message: '`lang:` tag present but no valid ISO 639-1 codes parsed from it'
    });
  }

  return { editionLanguages, ownerTags, issues };
}
