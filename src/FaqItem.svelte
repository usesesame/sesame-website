<script lang="ts">
  import type { Snippet } from 'svelte'
  import { slide } from 'svelte/transition'

  const { question, children }: { question: string; children?: Snippet } = $props()
  let open = $state(false)
</script>

<div class="faq-item" class:open>
  <h3>
    <button type="button" aria-expanded={open} onclick={() => (open = !open)}>
      <span>{question}</span>
      <span class="faq-toggle" aria-hidden="true"><span class="faq-bar"></span><span class="faq-bar"></span></span>
    </button>
  </h3>
  {#if open}
    <div class="faq-answer" transition:slide={{ duration: 380 }}>
      {@render children?.()}
    </div>
  {/if}
</div>
