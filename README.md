# Your board game café website

This is the website for your café's game shelf. It has two pages:

- **서가 / Library** — a searchable, sortable list of every game on your shelf.
- **뭐 할까요? / What to play** — your own hand-picked recommendations.

The game list refreshes itself **twice a day** from your BoardGameGeek (BGG)
GeekList. You don't need to touch code to keep it up to date — you just tag your
games on BGG, and the site catches up on its own.

This guide is written for you, the owner. No programming needed for day-to-day
use.

---

## 1. First-time setup (fill in the blanks)

A few placeholders need your real details. Search the project for each token and
replace it:

| Placeholder | Where | What to put |
| --- | --- | --- |
| `__CAFE_NAME__` | `config/site.config.ts` | Your café's name (shows in the header and browser tab). |
| `__GEEKLIST_ID__` | `config/site.config.ts` (`geeklistId`) | Your BGG GeekList's number — already set to **352945**. |
| `siteUrl` | `config/site.config.ts` | Your final web address, e.g. `https://mycafe.pages.dev`. |
| `userAgent` | `config/site.config.ts` | Put your café name + a contact email so BGG knows who's asking. |
| Logo | `assets/logo.svg` and `static/logo.svg` | Replace with your logo. The colours of the whole site come from it. |

> The current logo is a placeholder built from your brand colours. Replacing
> `static/logo.svg` swaps the picture in the header; if you want the site's
> colours to change too, update the values at the top of `src/app.css`.

---

## 2. How to tag your games on BGG

Each game on your shelf is one item in your GeekList. In that item's **comment
box** (the body text), add small tags so the site knows what languages your copy
is in. Everything else — player counts, playing time, difficulty, cover — comes
from BGG automatically.

### `lang:` — what language(s) your box is in

Use the two-letter code for each language printed on the box. Multiple languages
(a multilingual box) are separated by commas, no spaces.

```
lang:ko            → a Korean copy
lang:en            → an English copy
lang:ko,ja         → a box with Korean AND Japanese
```

Common codes:

| Language | Code |
| --- | --- |
| Korean | `ko` |
| English | `en` |
| Japanese | `ja` |
| Chinese | `zh` |
| French | `fr` |
| German | `de` |

### `tag:` — your own labels (optional)

For anything you want to note for yourself. These are stored but not shown on
the site yet.

```
tag:staff-pick
tag:new-arrival
```

### A full example

A GeekList item comment might read:

```
lang:ko,ja tag:staff-pick
```

That means: the box has Korean and Japanese, and it's a staff pick.

### If you make a typo

Nothing breaks. If you write `lang:kr` (not a real code) or forget the `lang:`
tag entirely, the game **still appears** — the mistake is just written into
**`data/fetch-report.md`** so you can fix it when convenient. A game is never
dropped because of a tag error.

---

## 3. Editing your recommendations

The **What to play** page reads one file: **`data/recommendations.json`**. Open
it in any text editor. It has two parts.

**Keywords** (the mood chips guests can tap). The order here is the order they
appear on the page:

```jsonc
{ "id": "coop", "label": { "en": "Co-operative", "ko": "협력" } }
```

**Entries** (each hand-picked game):

```jsonc
{
  "gameId": 174430,            // the BGG number of the game (must be on your shelf)
  "players": [1, 2, 3, 4],     // player counts this pick is good for
  "keywords": ["coop"],        // any keyword ids from the list above
  "note": {                    // a one-line pitch, in both languages
    "en": "The co-op campaign everyone asks about.",
    "ko": "모두가 물어보는 협력 캠페인 게임."
  },
  "priority": 1                // smaller number = shown first
}
```

Tips so you don't break the file:

- Keep every `"quote"` and `,` comma exactly as shown. Don't put a comma after
  the **last** item in a list.
- `gameId` must be a game that's on your shelf (in the GeekList). If it isn't,
  that entry is quietly skipped and noted in `data/fetch-report.md`.
- Every keyword you use in an entry must exist in the keyword list at the top.

You don't need to copy the game's name, cover, or stats — those come from BGG
automatically using the `gameId`.

---

## 4. Refreshing the game list

The site updates itself **automatically at midnight and noon (KST)** — you don't
have to do anything.

**To refresh right now** (for example, after adding new games to your GeekList):

1. Go to your project on GitHub.
2. Click the **Actions** tab.
3. Choose **Refresh game data** on the left.
4. Click **Run workflow**.

A minute or two later the new games appear on the site.

### When something looks off

Open **`data/fetch-report.md`** in your project. It lists every warning and error
from the last refresh — a mistyped `lang:` code, a game BGG couldn't find, a
recommendation pointing at a game that's no longer on the shelf. Each line
includes the game name and a link to its BGG page.

---

## 5. Putting the site online (Cloudflare Pages)

You only do this once.

1. Push this project to a GitHub repository.
2. Sign in at **Cloudflare Pages** and choose **Create a project → Connect to
   Git**, then pick this repository.
3. Set the build settings:
   - **Framework preset:** none / SvelteKit
   - **Build command:** `npm run build`
   - **Build output directory:** `build`
   - **Environment variables / secrets:** none needed.
4. Click **Save and Deploy**.

From then on, every automatic data refresh pushes to GitHub, and Cloudflare
Pages redeploys the site on its own. There's nothing else to run.

---

## 6. For a developer (optional)

```bash
npm install        # install dependencies
npm run dev        # local dev server
npm run fetch      # pull fresh data from BGG into data/ + static/covers/
npm run build      # produce the static site in build/
npm run check      # type-check
```

- **Stack:** SvelteKit (Svelte 5 runes) + `adapter-static`, TypeScript, hand-written CSS.
- **Data pipeline:** `scripts/fetch.ts` (Node 22, run via `tsx`) — polite BGG
  client with 202-retry, tag parsing/validation, `sharp` cover thumbnails,
  deterministic `data/games.json`.
- **No backend, no database, no runtime BGG calls.** The committed JSON is
  bundled at build time.
- The shared data shape lives in `src/lib/types.ts`.
