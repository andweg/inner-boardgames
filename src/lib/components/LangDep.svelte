<script lang="ts">
  import { t } from '$lib/i18n/store.ts';
  import type { LanguageDependence } from '$lib/types.ts';

  let {
    level,
    votes
  }: { level: LanguageDependence | null; votes: number } = $props();

  const levelKey = $derived(
    level == null
      ? ('langdep.unknown' as const)
      : (`langdep.${level}` as const)
  );
  const title = $derived(
    level == null
      ? $t('langdep.unknown')
      : `${$t(levelKey)} (${votes})`
  );
</script>

<span class="langdep" class:unknown={level == null} title={title}>
  <span class="bars" aria-hidden="true">
    {#each Array(5) as _, i}
      <span class="bar" class:on={level != null && i < level}></span>
    {/each}
  </span>
  <span class="visually-hidden">{title}</span>
</span>

<style>
  .langdep {
    display: inline-flex;
    align-items: center;
  }
  .bars {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 16px;
  }
  /* A rising 5-step meter: taller + warmer as text-dependence climbs. */
  .bar {
    width: 4px;
    border: 1.5px solid var(--line);
    border-radius: 2px;
    background: var(--surface);
  }
  .bar:nth-child(1) { height: 6px; }
  .bar:nth-child(2) { height: 8px; }
  .bar:nth-child(3) { height: 10px; }
  .bar:nth-child(4) { height: 13px; }
  .bar:nth-child(5) { height: 16px; }
  .bar.on {
    background: var(--sky);
  }
  /* The two heaviest levels read as a warning — this is the text-heavy end. */
  .bar:nth-child(4).on { background: var(--yellow); }
  .bar:nth-child(5).on { background: var(--red); }
  .unknown .bars {
    opacity: 0.5;
  }
</style>
