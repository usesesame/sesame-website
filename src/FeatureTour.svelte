<script lang="ts">
  import ProductPicture from './ProductPicture.svelte'
  import { slidingSelection } from './lib/sliding-selection'

  type Feature = { key: string; title: string; summary: string; detail: string; shot: string; alt: string }

  const { features }: { features: Feature[] } = $props()

  let active = $state(0)
  const tabs: HTMLButtonElement[] = $state([])

  function select(index: number, focus = false) {
    active = (index + features.length) % features.length
    if (focus) tabs[active]?.focus()
  }

  function onKeydown(event: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: features.length - 1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    select(moves[event.key], true)
  }
</script>

<div class="tour">
  <div class="tour-tabs" role="tablist" aria-label="What Sesame does" use:slidingSelection>
    {#each features as feature, index (feature.key)}
      <button
        bind:this={tabs[index]}
        id={`tour-tab-${feature.key}`}
        class="tour-tab"
        class:active={index === active}
        type="button"
        role="tab"
        aria-selected={index === active}
        aria-controls="tour-panel"
        tabindex={index === active ? 0 : -1}
        onclick={() => select(index)}
        onkeydown={onKeydown}
      >
        <span class="tour-tab-title">{feature.title}</span>
        <span class="tour-tab-summary">{feature.summary}</span>
      </button>
    {/each}
  </div>

  <div class="tour-panel" id="tour-panel" role="tabpanel" aria-labelledby={`tour-tab-${features[active].key}`}>
    <p class="tour-detail">{features[active].detail}</p>
    <div class="tour-stage">
      {#each features as feature, index (feature.key)}
        <div class="tour-shot" class:active={index === active} aria-hidden={index !== active}>
          <ProductPicture name={feature.shot} alt={index === active ? feature.alt : ''} width={1040} height={680} eager={index === 0} />
        </div>
      {/each}
    </div>
  </div>
</div>
