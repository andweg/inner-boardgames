<script lang="ts">
  import { t } from '$lib/i18n/store.ts';

  let {
    src,
    name,
    size = 56
  }: { src: string; name: string; size?: number } = $props();

  let failed = $state(false);

  // Two-letter monogram for the fallback tile.
  const initials = $derived(
    name
      .replace(/[^\p{L}\p{N}\s]/gu, '')
      .trim()
      .slice(0, 2)
      .toUpperCase() || '?'
  );
</script>

<span class="cover" style={`--s:${size}px`}>
  {#if failed}
    <span class="fallback" aria-hidden="true">{initials}</span>
  {:else}
    <img
      {src}
      alt={`${name} ${$t('a11y.coverAlt')}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onerror={() => (failed = true)}
    />
  {/if}
</span>

<style>
  /* Signature device: every cover sits like a game box on the table —
     a chunky ink outline and a hard offset shadow, echoing the logo. */
  .cover {
    display: inline-flex;
    width: var(--s);
    height: var(--s);
    border: var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface-alt);
    box-shadow: var(--shadow-hard);
    overflow: hidden;
    flex: none;
  }
  img,
  .fallback {
    width: 100%;
    height: 100%;
  }
  img {
    /* Show the whole cover, letterboxed within the square tile rather than
       cropped to fill it. */
    object-fit: contain;
  }
  .fallback {
    display: grid;
    place-items: center;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: calc(var(--s) * 0.34);
    color: var(--teal);
    background: repeating-linear-gradient(
      45deg,
      var(--mint),
      var(--mint) 8px,
      var(--yellow) 8px,
      var(--yellow) 16px
    );
  }
</style>
