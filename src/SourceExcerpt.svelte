<script lang="ts">
  import type { SourceExcerpt } from './lib/source-excerpts'

  const { excerpt }: { excerpt: SourceExcerpt } = $props()
  const file = $derived(excerpt.path.split('/').pop() ?? excerpt.path)
</script>

<figure class="excerpt">
  <figcaption>
    <span class="mono excerpt-path">{excerpt.path}</span>
    <a href={excerpt.url} rel="noreferrer">View on GitHub</a>
  </figcaption>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <pre tabindex="0" aria-label={`Source code from ${file}, starting at line ${excerpt.start}`}><code>{#each excerpt.lines as line, index (index)}<span class="excerpt-line" class:marked={excerpt.marked.includes(excerpt.start + index)}><span class="excerpt-number" aria-hidden="true">{excerpt.start + index}</span><span class="excerpt-text">{line || ' '}</span></span>{/each}</code></pre>
</figure>
