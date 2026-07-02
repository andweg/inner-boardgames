<!--
  The index route redirects to /recommend (see +page.ts), so this component is
  never rendered. It exists only as a no-JS fallback link.
-->
<p class="fallback">
  Redirecting to <a href="/recommend">recommendations</a>…
</p>

<style>
  .fallback {
    padding: 2rem 1rem;
    text-align: center;
    color: var(--ink-soft);
  }
</style>
