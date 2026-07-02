<script lang="ts">
  import { locale, t } from '$lib/i18n/store.ts';
  import type { Game, RecommendationEntry } from '$lib/types.ts';
  import Cover from './Cover.svelte';
  import WeightDots from './WeightDots.svelte';

  let { entry, game }: { entry: RecommendationEntry; game: Game } = $props();

  const range = $derived(
    game.minPlayers === game.maxPlayers
      ? `${game.minPlayers}`
      : `${game.minPlayers}–${game.maxPlayers}`
  );
</script>

<article class="card">
  <div class="cover">
    <Cover src={game.cover} name={game.name} size={96} />
  </div>
  <div class="body">
    <h3 class="name">{game.name}</h3>
    {#if entry.note}
      <p class="note">{entry.note[$locale]}</p>
    {/if}
    <dl class="stats">
      <div>
        <dt>{$t('col.players')}</dt>
        <dd class="tnum">{range} {$t('val.players')}</dd>
      </div>
      <div>
        <dt>{$t('col.time')}</dt>
        <dd class="tnum">{game.playingTime} {$t('val.minutes')}</dd>
      </div>
      <div>
        <dt>{$t('col.weight')}</dt>
        <dd><WeightDots weight={game.weight} /></dd>
      </div>
    </dl>
  </div>
</article>

<style>
  .card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    background: var(--surface);
    border: var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-hard);
    padding: 1rem;
  }
  .name {
    margin: 0 0 0.3rem;
    font-size: 1.15rem;
  }
  .note {
    margin: 0 0 0.6rem;
    color: var(--ink-soft);
  }
  .stats {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem 1.4rem;
    margin: 0;
  }
  .stats div {
    display: flex;
    flex-direction: column;
  }
  .stats dt {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--ink-soft);
  }
  .stats dd {
    margin: 0;
    font-weight: 600;
  }
  @media (max-width: 460px) {
    .card {
      padding: 0.8rem;
      gap: 0.8rem;
    }
  }
</style>
