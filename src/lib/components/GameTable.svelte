<script lang="ts">
  import { t } from '$lib/i18n/store.ts';
  import type { Game } from '$lib/types.ts';
  import type { SortKey, SortDir } from '$lib/filters.ts';
  import Cover from './Cover.svelte';
  import PlayerBadge from './PlayerBadge.svelte';
  import WeightDots from './WeightDots.svelte';
  import LangDep from './LangDep.svelte';
  import LangBadges from './LangBadges.svelte';

  let {
    games,
    sortKey,
    sortDir,
    onsort
  }: {
    games: Game[];
    sortKey: SortKey;
    sortDir: SortDir;
    onsort: (key: SortKey) => void;
  } = $props();

  const sortable: { key: SortKey; label: any }[] = [
    { key: 'title', label: 'col.title' },
    { key: 'players', label: 'col.players' },
    { key: 'time', label: 'col.time' },
    { key: 'weight', label: 'col.weight' }
  ];

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';
</script>

<table class="games">
  <thead>
    <tr>
      <th class="c-cover" scope="col"><span class="visually-hidden">{$t('col.cover')}</span></th>
      {#each sortable as col}
        <th scope="col" aria-sort={ariaSort(col.key)} class={`c-${col.key}`}>
          <button type="button" class="sortbtn" onclick={() => onsort(col.key)}>
            {$t(col.label)}
            <span class="arrow" aria-hidden="true">
              {#if sortKey === col.key}{sortDir === 'asc' ? '▲' : '▼'}{:else}◇{/if}
            </span>
          </button>
        </th>
      {/each}
      <th class="c-langdep" scope="col">{$t('col.langDep')}</th>
      <th class="c-editions" scope="col">{$t('col.editions')}</th>
    </tr>
  </thead>
  <tbody>
    {#each games as g (g.id)}
      <tr>
        <td class="c-cover cover-cell">
          <Cover src={g.cover} name={g.name} size={56} />
        </td>
        <td class="c-title" data-label={$t('col.title')}>
          <span class="title">{g.name}</span>
          {#if g.yearPublished}<span class="year tnum">{g.yearPublished}</span>{/if}
          {#if g.subtype === 'boardgameexpansion'}
            <span class="exp-tag">{$t('val.expansion')}</span>
          {/if}
        </td>
        <td class="c-players" data-label={$t('col.players')}>
          <PlayerBadge min={g.minPlayers} max={g.maxPlayers} bestWith={g.bestWith} />
        </td>
        <td class="c-time tnum" data-label={$t('col.time')}>
          {#if g.minPlayTime && g.maxPlayTime && g.minPlayTime !== g.maxPlayTime}
            {g.minPlayTime}–{g.maxPlayTime}
          {:else}
            {g.playingTime}
          {/if}
          <span class="unit">{$t('val.minutes')}</span>
        </td>
        <td class="c-weight" data-label={$t('col.weight')}>
          <WeightDots weight={g.weight} />
        </td>
        <td class="c-langdep" data-label={$t('col.langDep')}>
          <LangDep level={g.languageDependence} votes={g.languageDependenceVotes} />
        </td>
        <td class="c-editions" data-label={$t('col.editions')}>
          <LangBadges languages={g.editionLanguages} />
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .games {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  thead th {
    position: sticky;
    top: 60px; /* below the sticky header */
    z-index: 5;
    background: var(--surface-alt);
    text-align: left;
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: var(--ink-soft);
    padding: 0.5rem 0.75rem;
    border-bottom: var(--border);
    white-space: nowrap;
  }
  thead th:first-child {
    border-top-left-radius: var(--radius-sm);
  }
  thead th:last-child {
    border-top-right-radius: var(--radius-sm);
  }
  .sortbtn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    background: none;
    border: 0;
    padding: 0;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: inherit;
    font-weight: 700;
  }
  .sortbtn:hover {
    color: var(--ink);
  }
  .arrow {
    color: var(--red);
    font-size: 0.7em;
  }
  th[aria-sort='none'] .arrow {
    color: var(--line-soft);
  }

  tbody td {
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid var(--line-soft);
    vertical-align: middle;
  }
  tbody tr:nth-child(even) td {
    background: var(--surface-alt);
  }
  tbody tr:hover td {
    background: color-mix(in srgb, var(--yellow) 40%, var(--surface));
  }
  .cover-cell {
    width: 72px;
    padding-left: 0.5rem;
  }
  .title {
    font-weight: 600;
  }
  .year {
    color: var(--ink-soft);
    font-size: 0.8rem;
    margin-left: 0.35rem;
  }
  .exp-tag {
    display: inline-block;
    margin-left: 0.4rem;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    background: var(--mint);
    border: 1.5px solid var(--line);
  }
  .c-time .unit {
    color: var(--ink-soft);
    font-size: 0.8rem;
  }

  /* -------- Mobile: collapse rows into comfortable cards -------- */
  @media (max-width: 700px) {
    thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
    .games,
    tbody,
    tr,
    td {
      display: block;
    }
    tbody tr {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: 0.85rem;
      align-items: center;
      background: var(--surface);
      border: var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow-hard);
      padding: 0.75rem;
      margin-bottom: 0.8rem;
    }
    tbody tr:nth-child(even) td,
    tbody tr:hover td {
      background: transparent;
    }
    td {
      padding: 0;
      border: 0;
    }
    .cover-cell {
      grid-row: 1 / span 5;
      width: auto;
      align-self: start;
    }
    /* Right column: each datum on its own line with a small label. */
    .c-title {
      margin-bottom: 0.35rem;
    }
    .c-players,
    .c-time,
    .c-weight,
    .c-langdep,
    .c-editions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.18rem 0;
      min-height: 1.6rem;
    }
    .c-players::before,
    .c-time::before,
    .c-weight::before,
    .c-langdep::before,
    .c-editions::before {
      content: attr(data-label);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      color: var(--ink-soft);
    }
  }
</style>
