<script lang="ts">
  import { gamesById, recommendations, validRecEntries } from '$lib/data.ts';
  import { locale, t } from '$lib/i18n/store.ts';
  import { siteConfig } from '../../../config/site.config.ts';
  import RecommendCard from '$lib/components/RecommendCard.svelte';

  // Player picker: 1–8, plus "9+" which we represent as 9.
  const counts = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const countLabel = (n: number) => (n === 9 ? '9+' : String(n));

  let players = $state<number>(4);
  let activeKeywords = $state<Set<string>>(new Set());

  function toggleKeyword(id: string) {
    const next = new Set(activeKeywords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    activeKeywords = next;
  }

  const matches = $derived(
    validRecEntries
      .filter((e) => e.players.includes(players))
      .filter(
        (e) =>
          activeKeywords.size === 0 ||
          e.keywords.some((k) => activeKeywords.has(k))
      )
      .sort((a, b) => a.priority - b.priority)
  );
</script>

<svelte:head>
  <title>{siteConfig.cafeName} · {$t('rec.title')}</title>
  <meta name="description" content={$t('rec.subtitle')} />
</svelte:head>

<section class="intro">
  <h1>{$t('rec.title')}</h1>
  <p class="lede">{$t('rec.subtitle')}</p>
</section>

<div class="picker">
  <span class="lbl">{$t('rec.players')}</span>
  <div class="counts" role="group" aria-label={$t('rec.players')}>
    {#each counts as n}
      <button
        type="button"
        class="token"
        class:on={players === n}
        aria-pressed={players === n}
        onclick={() => (players = n)}
      >
        {countLabel(n)}
      </button>
    {/each}
  </div>
</div>

{#if recommendations.keywords.length > 0}
  <div class="picker">
    <span class="lbl">{$t('rec.keywords')}</span>
    <div class="chips">
      {#each recommendations.keywords as kw}
        <button
          type="button"
          class="chip"
          class:on={activeKeywords.has(kw.id)}
          aria-pressed={activeKeywords.has(kw.id)}
          onclick={() => toggleKeyword(kw.id)}
        >
          {kw.label[$locale]}
        </button>
      {/each}
    </div>
  </div>
{/if}

{#if matches.length === 0}
  <div class="empty">
    <p class="e-title">{$t('rec.empty.title')}</p>
    <p class="e-hint">{$t('rec.empty.hint')}</p>
    <a class="e-link" href="/library">{$t('rec.empty.link')}</a>
  </div>
{:else}
  <div class="grid">
    {#each matches as entry (entry.gameId)}
      {@const game = gamesById.get(entry.gameId)}
      {#if game}
        <RecommendCard {entry} {game} />
      {/if}
    {/each}
  </div>
{/if}

<style>
  .intro {
    margin-bottom: 1.25rem;
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
  .picker {
    margin-bottom: 1.5rem;
  }
  .lbl {
    display: block;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--ink-soft);
    margin-bottom: 0.6rem;
  }
  /* The player picker is the recommender's signature moment — big, tactile,
     game-piece tokens you tap. */
  .counts {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .token {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: var(--border);
    background: var(--surface);
    box-shadow: var(--shadow-hard);
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--ink);
    transition: transform 0.08s ease;
  }
  .token:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--line);
  }
  .token.on {
    background: var(--red);
    color: #fff;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .chip {
    padding: 0.45rem 1rem;
    border-radius: var(--radius-pill);
    border: var(--border);
    background: var(--surface);
    box-shadow: var(--shadow-hard);
    font-weight: 600;
    color: var(--ink);
    transition: transform 0.08s ease;
  }
  .chip:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--line);
  }
  .chip.on {
    background: var(--chip-on);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
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
    margin: 0 0 1rem;
    color: var(--ink-soft);
  }
  .e-link {
    display: inline-block;
    padding: 0.5rem 1.1rem;
    background: var(--teal);
    color: #fff;
    border-radius: var(--radius-pill);
    text-decoration: none;
    font-weight: 600;
    border: var(--border);
    box-shadow: var(--shadow-hard);
  }
  @media (max-width: 460px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
