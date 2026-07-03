<script lang="ts">
  import { t } from '$lib/i18n/store.ts';
  import type { Game } from '$lib/types.ts';
  import { accentFor } from '$lib/accent.ts';
  import WeightDots from './WeightDots.svelte';
  import LangBadges from './LangBadges.svelte';

  let { game }: { game: Game } = $props();

  let failed = $state(false);

  const accent = $derived(accentFor(game));
  const players = $derived(
    game.minPlayers === game.maxPlayers
      ? `${game.minPlayers}`
      : `${game.minPlayers}–${game.maxPlayers}`
  );
  const time = $derived(
    game.minPlayTime && game.maxPlayTime && game.minPlayTime !== game.maxPlayTime
      ? `${game.minPlayTime}–${game.maxPlayTime}`
      : `${game.playingTime}`
  );
  const initials = $derived(
    game.name
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim()
      .slice(0, 2)
      .toUpperCase() || '?'
  );
</script>

<a
  class="card"
  style={`--accent:${accent}`}
  href={`https://boardgamegeek.com/boardgame/${game.id}`}
  target="_blank"
  rel="noreferrer"
>
  <div class="art">
    {#if failed}
      <span class="fallback" aria-hidden="true">{initials}</span>
    {:else}
      <img
        src={game.cover}
        alt={`${game.name} ${$t('a11y.coverAlt')}`}
        loading="lazy"
        decoding="async"
        onerror={() => (failed = true)}
      />
    {/if}
    {#if game.subtype === 'boardgameexpansion'}
      <span class="exp">{$t('val.expansion')}</span>
    {/if}
  </div>

  <div class="body">
    <h3 class="title">
      {game.name}{#if game.yearPublished}<span class="year tnum">{game.yearPublished}</span>{/if}
    </h3>

    <div class="meta">
      <span class="stat" title={$t('col.players')}>
        <svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
          ><path
            d="M12 2a3 3 0 0 1 1.1 5.8C15.7 8.7 17 10.2 17 12v1h-2l-.8 8H9.8L9 13H7v-1c0-1.8 1.3-3.3 3.9-4.2A3 3 0 0 1 12 2Z"
          /></svg
        ><span class="tnum">{players}</span>
      </span>
      <span class="stat" title={$t('col.time')}>
        <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"
          ><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 1.8" /></svg
        ><span class="tnum">{time}</span><span class="unit">{$t('val.minutes')}</span>
      </span>
    </div>

    <div class="foot">
      <WeightDots weight={game.weight} />
      <LangBadges languages={game.editionLanguages} />
    </div>
  </div>
</a>

<style>
  .card {
    --tint: color-mix(in srgb, var(--accent) 12%, var(--surface));
    display: flex;
    flex-direction: column;
    background: var(--surface);
    border: 2px solid var(--line);
    border-radius: 14px;
    overflow: hidden;
    text-decoration: none;
    color: var(--ink);
    box-shadow: var(--shadow-soft);
    transition:
      transform 0.16s ease,
      box-shadow 0.16s ease,
      border-color 0.16s ease;
  }
  .card:hover,
  .card:focus-visible {
    transform: translateY(-4px);
    border-color: var(--accent);
    box-shadow: 0 10px 24px color-mix(in srgb, var(--accent) 34%, transparent);
  }

  /* Cover sits like box art on a shelf: full image (contain) on a soft wash of
     its own accent colour, so even letterboxed covers feel colourful. */
  .art {
    position: relative;
    aspect-ratio: 1 / 1;
    display: grid;
    place-items: center;
    padding: 10px;
    background: radial-gradient(
      circle at 50% 38%,
      color-mix(in srgb, var(--accent) 24%, var(--surface)),
      var(--tint)
    );
    border-bottom: 2px solid var(--line);
  }
  .art img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 4px;
    filter: drop-shadow(0 3px 6px rgba(22, 33, 31, 0.28));
  }
  .fallback {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(1.8rem, 7vw, 2.6rem);
    color: #fff;
    background: color-mix(in srgb, var(--accent) 78%, #000 4%);
    border-radius: 6px;
  }
  .exp {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 0.66rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    background: var(--mint);
    border: 1.5px solid var(--line);
  }

  .body {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.55rem 0.7rem 0.7rem;
  }
  .title {
    margin: 0;
    font-size: 1.02rem;
    line-height: 1.15;
  }
  .year {
    margin-left: 0.35rem;
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 0.78rem;
    color: var(--ink-soft);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem 0.9rem;
    color: var(--ink-soft);
    font-size: 0.85rem;
  }
  .stat {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
  }
  .stat .tnum {
    color: var(--ink);
    font-weight: 600;
  }
  .stat .unit {
    font-size: 0.72rem;
  }
  .ico {
    width: 15px;
    height: 15px;
    color: var(--accent);
    flex: none;
  }
  .foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.1rem;
  }
</style>
