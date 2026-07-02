<script lang="ts">
  import { t } from '$lib/i18n/store.ts';

  let {
    min,
    max,
    bestWith = []
  }: { min: number; max: number; bestWith?: number[] } = $props();

  const range = $derived(min === max ? `${min}` : `${min}–${max}`);
  // Show at most a couple of "best" counts to keep the cell calm.
  const bestLabel = $derived(bestWith.slice(0, 3).join(', '));
</script>

<span class="players">
  <span class="range tnum">{range}</span>
  {#if bestWith.length > 0}
    <span class="best" title={`${$t('val.best')} ${bestLabel}`}>
      <span class="dot" aria-hidden="true"></span>{$t('val.best')}
      {bestLabel}
    </span>
  {/if}
</span>

<style>
  .players {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    flex-wrap: wrap;
  }
  .range {
    font-weight: 600;
  }
  .best {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.72rem;
    color: var(--ink-soft);
    background: var(--surface-alt);
    border-radius: var(--radius-pill);
    padding: 1px 8px 1px 6px;
    white-space: nowrap;
  }
  .best .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--red);
    border: 1px solid var(--line);
  }
</style>
