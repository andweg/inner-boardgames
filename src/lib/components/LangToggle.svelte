<script lang="ts">
  import { locale, toggleLocale } from '$lib/i18n/store.ts';
</script>

<button
  type="button"
  class="toggle"
  onclick={toggleLocale}
  aria-label={$locale === 'ko' ? 'Switch to English' : '한국어로 전환'}
>
  <span class="opt" class:on={$locale === 'ko'}>한국어</span>
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
    transition: transform 0.08s ease;
  }
  .toggle:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--line);
  }
  .opt.on {
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--red);
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
  .sep {
    color: var(--line-soft);
  }
</style>
