<script lang="ts">
  let { languages }: { languages: string[] } = $props();
</script>

{#if languages.length === 0}
  <span class="none" title="edition language unknown">–</span>
{:else}
  <span class="badges">
    {#each languages as code}
      <span class="badge" data-lang={code}>{code.toUpperCase()}</span>
    {/each}
  </span>
{/if}

<style>
  .badges {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 3px;
  }
  .badge {
    display: inline-block;
    padding: 1px 6px;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    border: 1.5px solid var(--line);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--ink);
  }
  /* Give the two house languages a nudge of colour. */
  .badge[data-lang='ko'] {
    background: var(--mint);
  }
  .badge[data-lang='en'] {
    background: var(--yellow);
  }
  .none {
    color: var(--line-soft);
  }
</style>
