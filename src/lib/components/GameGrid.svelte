<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly, fade } from 'svelte/transition';
  import type { Game } from '$lib/types.ts';
  import { dur, stagger } from '$lib/motion.ts';
  import GameCard from './GameCard.svelte';

  let { games }: { games: Game[] } = $props();
</script>

<!-- The wall of box art. Cards fade/fly up on entry (staggered), and FLIP into
     place when the filter or sort reorders them. All gated by reduced-motion. -->
<div class="grid">
  {#each games as game, i (game.id)}
    <div
      class="cell"
      in:fly={{ y: 16, duration: dur(260), delay: stagger(i) }}
      out:fade={{ duration: dur(110) }}
      animate:flip={{ duration: dur(240) }}
    >
      <GameCard {game} />
    </div>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
  .cell {
    display: flex;
  }
  .cell > :global(.card) {
    width: 100%;
  }
  @media (max-width: 520px) {
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
      gap: 0.7rem;
    }
  }
</style>
