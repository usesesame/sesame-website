<script lang="ts">
  import type { Snippet } from 'svelte'

  const { question, children }: { question: string; children?: Snippet } = $props()
  const uid = $props.id()
  const answerId = `faq-answer-${uid}`
  let open = $state(false)
</script>

<div class="faq-item" class:open>
  <h3>
    <button type="button" aria-expanded={open} aria-controls={answerId} onclick={() => (open = !open)}>
      <span>{question}</span>
      <span class="faq-toggle" aria-hidden="true"><span class="faq-bar"></span><span class="faq-bar"></span></span>
    </button>
  </h3>
  <div id={answerId} class="faq-answer" hidden={!open}>
    {@render children?.()}
  </div>
</div>
