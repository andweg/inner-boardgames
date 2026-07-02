<script lang="ts">
  import { games } from '$lib/data.ts';
  import { t } from '$lib/i18n/store.ts';
  import { siteConfig } from '../../config/site.config.ts';
  import {
    defaultFilters,
    filterGames,
    sortGames,
    type FilterState,
    type SortKey,
    type SortDir
  } from '$lib/filters.ts';
  import Filters from '$lib/components/Filters.svelte';
  import GameTable from '$lib/components/GameTable.svelte';

  let filters = $state<FilterState>({ ...defaultFilters });
  let sortKey = $state<SortKey>('title');
  let sortDir = $state<SortDir>('asc');

  const filtered = $derived(filterGames(games, filters));
  const sorted = $derived(sortGames(filtered, sortKey, sortDir));

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
  <GameTable games={sorted} {sortKey} {sortDir} onsort={handleSort} />
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
