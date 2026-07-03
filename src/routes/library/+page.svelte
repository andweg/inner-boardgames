<script lang="ts">
  import { games } from '$lib/data.ts';
  import { t } from '$lib/i18n/store.ts';
  import { siteConfig } from '../../../config/site.config.ts';
  import {
    defaultFilters,
    filterGames,
    sortGames,
    type FilterState,
    type SortKey,
    type SortDir
  } from '$lib/filters.ts';
  import Filters from '$lib/components/Filters.svelte';
  import GameGrid from '$lib/components/GameGrid.svelte';

  let filters = $state<FilterState>({ ...defaultFilters });
  let sortKey = $state<SortKey>('title');
  let sortDir = $state<SortDir>('asc');

  const filtered = $derived(filterGames(games, filters));
  const sorted = $derived(sortGames(filtered, sortKey, sortDir));

  const sortOptions: { key: SortKey; label: any }[] = [
    { key: 'title', label: 'col.title' },
    { key: 'players', label: 'col.players' },
    { key: 'time', label: 'col.time' },
    { key: 'weight', label: 'col.weight' }
  ];

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }
</script>

<svelte:head>
  <title>{siteConfig.cafeName} · {$t('lib.title')}</title>
  <meta name="description" content={$t('lib.subtitle')} />
</svelte:head>

<section class="intro">
  <h1>{$t('lib.title')}</h1>
  <p class="lede">{$t('lib.subtitle')}</p>
</section>

<Filters bind:filters count={sorted.length} total={games.length} />

{#if sorted.length === 0}
  <div class="empty">
    <p class="e-title">{$t('lib.empty.title')}</p>
    <p class="e-hint">{$t('lib.empty.hint')}</p>
  </div>
{:else}
  <div class="sortbar">
    <span class="sort-label">{$t('a11y.sortBy')}</span>
    <div class="sort-group" role="group" aria-label={$t('a11y.sortBy')}>
      {#each sortOptions as opt}
        <button
          type="button"
          class="sort-btn"
          class:on={sortKey === opt.key}
          aria-pressed={sortKey === opt.key}
          onclick={() => handleSort(opt.key)}
        >
          {$t(opt.label)}
          {#if sortKey === opt.key}
            <span class="arrow" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <GameGrid games={sorted} />
{/if}

<style>
  .intro {
    margin-bottom: 1rem;
  }
  h1 {
    font-size: clamp(1.6rem, 4vw, 2.3rem);
    color: var(--teal);
  }
  .lede {
    margin: 0;
    color: var(--ink-soft);
    font-size: 1.05rem;
  }

  .sortbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    margin-bottom: 1rem;
  }
  .sort-label {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--ink-soft);
  }
  .sort-group {
    display: inline-flex;
    flex-wrap: wrap;
    border: var(--border);
    border-radius: var(--radius-pill);
    overflow: hidden;
    box-shadow: var(--shadow-hard);
  }
  .sort-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    background: var(--surface);
    border: 0;
    border-right: 2px solid var(--line);
    padding: 0.35rem 0.8rem;
    font-weight: 600;
    color: var(--ink);
  }
  .sort-btn:last-child {
    border-right: 0;
  }
  .sort-btn.on {
    background: var(--teal);
    color: #fff;
  }
  .arrow {
    font-size: 0.6em;
  }

  .empty {
    text-align: center;
    padding: 3rem 1rem;
    background: var(--surface);
    border: 2px dashed var(--line-soft);
    border-radius: var(--radius);
  }
  .e-title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.3rem;
    margin: 0 0 0.3rem;
  }
  .e-hint {
    margin: 0;
    color: var(--ink-soft);
  }
</style>
