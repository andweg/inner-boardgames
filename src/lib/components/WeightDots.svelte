<script lang="ts">
  import { t } from '$lib/i18n/store.ts';
  import { weightBucketOf } from '$lib/filters.ts';

  let { weight }: { weight: number | null } = $props();

  const bucket = $derived(weightBucketOf(weight));
  // Round to the nearest of five pips; unknown weights show empty pips.
  const filled = $derived(weight == null ? 0 : Math.max(1, Math.round(weight)));
  const label = $derived(
    weight == null
      ? $t('weight.unknown')
      : bucket === 'light'
        ? $t('weight.light')
        : bucket === 'medium'
          ? $t('weight.medium')
          : $t('weight.heavy')
  );
  const title = $derived(
    weight == null ? label : `${label} · ${weight.toFixed(1)} / 5`
  );
</script>

<span class="weight" class:unknown={weight == null} data-bucket={bucket} title={title}>
  <span class="pips" aria-hidden="true">
    {#each Array(5) as _, i}
      <span class="pip" class:on={i < filled}></span>
    {/each}
  </span>
  <span class="num tnum">{weight == null ? '–' : weight.toFixed(1)}</span>
  <span class="visually-hidden">{title}</span>
</span>

<style>
  .weight {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .pips {
    display: inline-flex;
    gap: 3px;
  }
  .pip {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 1.5px solid var(--line);
    background: var(--surface);
  }
  /* Colour the filled pips by weight bucket, echoing the logo discs. */
  [data-bucket='light'] .pip.on {
    background: var(--mint);
  }
  [data-bucket='medium'] .pip.on {
    background: var(--yellow);
  }
  [data-bucket='heavy'] .pip.on {
    background: var(--red);
  }
  .num {
    font-size: 0.85rem;
    color: var(--ink-soft);
    min-width: 1.9em;
  }
  .unknown .num {
    color: var(--line-soft);
  }
</style>
