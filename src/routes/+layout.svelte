<script lang="ts">
  import '../app.css';
  // Self-hosted display face (Latin + Korean subsets), bundled by Vite — no
  // runtime font-CDN call. Used only for headings/wordmark via --font-display.
  import '@fontsource/gaegu/400.css';
  import '@fontsource/gaegu/700.css';
  // Body face: self-hosted Gowun Dodum (soft humanist sans, Latin + Korean).
  import '@fontsource/gowun-dodum/400.css';
  import Header from '$lib/components/Header.svelte';
  import { generatedAt } from '$lib/data.ts';
  import { locale } from '$lib/i18n/store.ts';

  let { children } = $props();

  const refreshed = $derived(
    new Date(generatedAt).toLocaleDateString($locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  );
</script>

<Header />

<main class="container page">
  {@render children()}
</main>

<footer class="site-footer">
  <div class="container bar">
    <p>
      {$locale === 'ko' ? '데이터 갱신' : 'Data refreshed'}: <span class="tnum">{refreshed}</span>
      · <a href="https://boardgamegeek.com" rel="noreferrer">BoardGameGeek</a>
    </p>
    <p class="credit">
      Built by <a href="https://andweg.dev" rel="noreferrer">The Andrew</a>. Have fun.
    </p>
  </div>
</footer>

<style>
  .page {
    padding-top: 1.5rem;
    padding-bottom: 3rem;
    min-height: 60vh;
  }
  .site-footer {
    border-top: var(--border);
    background: var(--surface-alt);
    padding: 1.25rem 0;
    font-size: 0.85rem;
    color: var(--ink-soft);
  }
  .site-footer .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.35rem 1rem;
  }
  .site-footer p {
    margin: 0;
  }
  .credit {
    margin-left: auto;
  }
</style>
