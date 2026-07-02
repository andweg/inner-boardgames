<script lang="ts">
  import { page } from '$app/stores';
  import { t } from '$lib/i18n/store.ts';
  import { siteConfig } from '../../../config/site.config.ts';
  import LangToggle from './LangToggle.svelte';

  const isActive = (path: string) =>
    path === '/'
      ? $page.url.pathname === '/'
      : $page.url.pathname.startsWith(path);
</script>

<header class="site-header">
  <div class="container bar">
    <a class="brand" href="/">
      <img src="/logo.svg" alt="" width="40" height="40" />
      <span class="name">{siteConfig.cafeName}</span>
    </a>

    <nav class="nav" aria-label="Primary">
      <a href="/" class="link" class:active={isActive('/')} aria-current={isActive('/') ? 'page' : undefined}>
        {$t('nav.library')}
      </a>
      <a
        href="/recommend"
        class="link"
        class:active={isActive('/recommend')}
        aria-current={isActive('/recommend') ? 'page' : undefined}
      >
        {$t('nav.recommend')}
      </a>
      <LangToggle />
    </nav>
  </div>
</header>

<style>
  .site-header {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--sky);
    border-bottom: var(--border);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: 60px;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    color: var(--teal);
  }
  .brand img {
    border-radius: 50%;
    background: var(--surface);
    border: var(--border);
    box-shadow: var(--shadow-hard);
  }
  .name {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: -0.01em;
  }
  .nav {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .link {
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-pill);
    color: var(--teal);
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
  }
  .link:hover {
    background: rgba(255, 255, 255, 0.45);
  }
  .link.active {
    background: var(--surface);
    border: 2px solid var(--line);
  }
  @media (max-width: 460px) {
    .name {
      font-size: 1rem;
    }
    .link {
      padding: 0.3rem 0.5rem;
      font-size: 0.9rem;
    }
  }
</style>
