<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { locale, toggleLocale } from '$lib/i18n/store.ts';

  const KO_FULL = '한국어';
  let koEl: HTMLSpanElement;

  // Keep the Korean label on a single line: when the header squeezes it, show
  // only the first characters that fit (한국어 → 한국 → 한) instead of wrapping.
  function fit() {
    if (!koEl) return;
    koEl.textContent = KO_FULL;
    let n = KO_FULL.length;
    // Reading scrollWidth/clientWidth forces a reflow, so each pass measures
    // the trimmed text. Bounded by the word length — no risk of looping.
    while (n > 1 && koEl.scrollWidth > koEl.clientWidth) {
      n -= 1;
      koEl.textContent = KO_FULL.slice(0, n);
    }
  }

  onMount(() => {
    fit();
    const bar = koEl.closest('.bar') ?? document.body;
    const ro = new ResizeObserver(() => fit());
    ro.observe(bar);
    // Refit once the display font has loaded (its metrics change the width).
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  });

  // The active locale changes the nav label widths, so re-measure after it flips.
  $effect(() => {
    void $locale;
    tick().then(fit);
  });
</script>

<button
  type="button"
  class="toggle"
  onclick={toggleLocale}
  aria-label={$locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
>
  <span
    class="opt opt-ko"
    class:on={$locale === 'ko'}
    bind:this={koEl}
    title="한국어">한국어</span
  >
  <span class="sep" aria-hidden="true">/</span>
  <span class="opt" class:on={$locale === 'en'}>EN</span>
</button>

<style>
  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.7rem;
    background: var(--surface);
    border: var(--border);
    border-radius: var(--radius-pill);
    box-shadow: var(--shadow-hard);
    color: var(--ink-soft);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    min-width: 0; /* let the toggle be the element the header squeezes */
    transition: transform 0.08s ease;
  }
  .toggle:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--line);
  }
  .opt {
    flex: none;
  }
  /* The only shrinkable part: clipped to whole leading characters by fit(). */
  .opt-ko {
    flex: 0 1 auto;
    min-width: 1ch;
    overflow: hidden;
    text-overflow: clip;
    white-space: nowrap;
  }
  .opt.on {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--red);
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
  .sep {
    flex: none;
    color: var(--line-soft);
  }
</style>
