<script lang="ts">
  import { t } from '$lib/i18n/store.ts';
  import {
    defaultFilters,
    type FilterState,
    type WeightBucket,
    type LangMode
  } from '$lib/filters.ts';

  let {
    filters = $bindable(),
    count,
    total
  }: { filters: FilterState; count: number; total: number } = $props();

  // Mobile: the panel is collapsed behind a toggle.
  let open = $state(false);

  // 1–8 plus "9+" (value 9 = "9 or more"), matching the recommender's picker.
  const playerOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const weightOptions: { id: WeightBucket; key: any }[] = [
    { id: 'any', key: 'filter.weight.any' },
    { id: 'light', key: 'filter.weight.light' },
    { id: 'medium', key: 'filter.weight.medium' },
    { id: 'heavy', key: 'filter.weight.heavy' }
  ];
  const langOptions: { id: LangMode; key: any }[] = [
    { id: 'any', key: 'filter.lang.any' },
    { id: 'ko', key: 'filter.lang.ko' },
    { id: 'en', key: 'filter.lang.en' }
  ];

  function setPlayers(n: number) {
    filters.players = filters.players === n ? null : n;
    if (filters.players == null) filters.bestOnly = false;
  }

  function reset() {
    filters = { ...defaultFilters };
  }

  const isDefault = $derived(
    filters.search === defaultFilters.search &&
      filters.players === defaultFilters.players &&
      filters.bestOnly === defaultFilters.bestOnly &&
      filters.weight === defaultFilters.weight &&
      filters.lang === defaultFilters.lang &&
      filters.hideExpansions === defaultFilters.hideExpansions
  );
</script>

<section class="filters" class:open aria-label={$t('lib.filters')}>
  <div class="topbar">
    <button
      type="button"
      class="disclosure"
      onclick={() => (open = !open)}
      aria-expanded={open}
    >
      <span class="knob" aria-hidden="true"></span>
      {$t('lib.filters')}
    </button>
    <p class="count tnum" aria-live="polite">
      <strong>{count}</strong>
      {#if count !== total}<span class="of">/ {total}</span>{/if}
      {$t('lib.results')}
    </p>
    <button type="button" class="reset" onclick={reset} disabled={isDefault}>
      {$t('lib.reset')}
    </button>
  </div>

  <div class="body" hidden={!open}>
    <!-- Search -->
    <div class="field field-search">
      <label class="lbl" for="f-search">{$t('lib.search')}</label>
      <input
        id="f-search"
        type="search"
        class="search"
        bind:value={filters.search}
        placeholder={$t('lib.search')}
        autocomplete="off"
      />
    </div>

    <!-- Player count -->
    <div class="field">
      <span class="lbl">{$t('filter.players')}</span>
      <div class="players" role="group" aria-label={$t('filter.players')}>
        {#each playerOptions as n}
          <button
            type="button"
            class="token"
            class:on={filters.players === n}
            aria-pressed={filters.players === n}
            onclick={() => setPlayers(n)}
          >
            <svg class="meeple" viewBox="0 0 24 24" aria-hidden="true"
              ><path
                d="M12 2a3 3 0 0 1 1.1 5.8C15.7 8.7 17 10.2 17 12v1h-2l-.8 8H9.8L9 13H7v-1c0-1.8 1.3-3.3 3.9-4.2A3 3 0 0 1 12 2Z"
              /></svg
            >
            <span class="num tnum">{n === 9 ? '9+' : n}</span>
          </button>
        {/each}
      </div>
      {#if filters.players != null}
        <label class="check best-check">
          <input type="checkbox" bind:checked={filters.bestOnly} />
          {$t('filter.players.best')}
        </label>
      {/if}
    </div>

    <!-- Weight -->
    <div class="field">
      <span class="lbl">{$t('filter.weight')}</span>
      <div class="segmented" role="group" aria-label={$t('filter.weight')}>
        {#each weightOptions as opt}
          <button
            type="button"
            class="seg"
            class:on={filters.weight === opt.id}
            aria-pressed={filters.weight === opt.id}
            onclick={() => (filters.weight = opt.id)}
          >
            {$t(opt.key)}
          </button>
        {/each}
      </div>
    </div>

    <!-- Language playability (flagship) -->
    <div class="field">
      <span class="lbl">{$t('filter.lang')}</span>
      <div class="segmented" role="group" aria-label={$t('filter.lang')}>
        {#each langOptions as opt}
          <button
            type="button"
            class="seg"
            class:on={filters.lang === opt.id}
            aria-pressed={filters.lang === opt.id}
            onclick={() => (filters.lang = opt.id)}
          >
            <svg class="seg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              ><path d="M4 5h16v10H10l-4 4v-4H4z" stroke-linejoin="round" /></svg
            >{$t(opt.key)}
          </button>
        {/each}
      </div>
    </div>

    <!-- Expansions -->
    <div class="field">
      <label class="check">
        <input type="checkbox" bind:checked={filters.hideExpansions} />
        {$t('filter.expansions')}
      </label>
    </div>
  </div>
</section>

<style>
  .filters {
    background: var(--surface);
    border: var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-hard);
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
  }
  .topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .disclosure {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: 0;
    padding: 0;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--ink);
  }
  .disclosure .knob {
    display: none;
  }
  .count {
    margin: 0;
    margin-left: auto;
    color: var(--ink-soft);
    font-size: 0.95rem;
  }
  .count strong {
    color: var(--ink);
    font-size: 1.1rem;
  }
  .count .of {
    color: var(--line-soft);
  }
  .reset {
    background: var(--surface-alt);
    border: 2px solid var(--line);
    border-radius: var(--radius-pill);
    padding: 0.25rem 0.8rem;
    font-weight: 600;
    color: var(--ink);
  }
  .reset:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 1.5rem;
    margin-top: 1rem;
  }
  .field-search {
    grid-column: 1 / -1;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .lbl {
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--ink-soft);
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .search {
    width: 100%;
    padding: 0.6rem 0.8rem;
    border: var(--border);
    border-radius: var(--radius-sm);
    background: var(--paper);
    font-size: 1rem;
  }

  /* Player tokens — round like game pieces, the signature motif reused. */
  .players {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .token {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 50%;
    border: var(--border);
    background: var(--surface);
    color: var(--ink);
    box-shadow: var(--shadow-hard);
    transition: transform 0.08s ease;
  }
  .token .meeple {
    width: 15px;
    height: 15px;
    fill: currentColor;
    opacity: 0.75;
  }
  .token .num {
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1;
  }
  .token:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--line);
  }
  .token.on {
    background: var(--red);
    color: #fff;
  }
  .token.on .meeple {
    opacity: 1;
  }
  .best-check {
    margin-top: 0.1rem;
  }

  .segmented {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0;
    border: var(--border);
    border-radius: var(--radius-pill);
    overflow: hidden;
    width: fit-content;
    box-shadow: var(--shadow-hard);
  }
  .seg {
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    background: var(--surface);
    border: 0;
    border-right: 2px solid var(--line);
    padding: 0.4rem 0.85rem;
    font-weight: 600;
    color: var(--ink);
  }
  .seg-ico {
    width: 15px;
    height: 15px;
    opacity: 0.7;
  }
  .seg:last-child {
    border-right: 0;
  }
  .seg.on {
    background: var(--teal);
    color: #fff;
  }
  .seg.on .seg-ico {
    opacity: 1;
  }

  .check {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.95rem;
  }
  .check input {
    width: 1.1rem;
    height: 1.1rem;
    accent-color: var(--red);
  }

  /* -------- Mobile: collapse into a toggleable panel -------- */
  @media (max-width: 700px) {
    .disclosure .knob {
      display: inline-block;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid var(--ink);
      transition: transform 0.15s ease;
    }
    .filters.open .disclosure .knob {
      transform: rotate(180deg);
    }
    .body {
      grid-template-columns: 1fr;
    }
  }
  @media (min-width: 701px) {
    /* On desktop the panel is always shown regardless of `open`. */
    .body[hidden] {
      display: grid;
    }
    .disclosure {
      cursor: default;
    }
  }
</style>
