<script lang="ts">
  import { onMount } from 'svelte'
  import ProductPicture from './ProductPicture.svelte'
  import { glideTo } from './lib/glide'
  import { slidingSelection } from './lib/sliding-selection'

  type Feature = { key: string; title: string; detail: string; shot: string; alt: string }

  const { features, title }: { features: Feature[]; title: string } = $props()

  let active = $state(0)
  let track: HTMLElement | undefined = $state()
  const tabs: HTMLButtonElement[] = $state([])
  const pinned = '(min-width: 1000px) and (min-height: 600px)'

  function scrollable() {
    return track ? track.offsetHeight - (window.innerHeight - 68) : 0
  }

  function select(index: number, focus = false) {
    active = (index + features.length) % features.length
    if (focus) tabs[active]?.focus()
    if (track && window.matchMedia(pinned).matches) {
      const top = track.getBoundingClientRect().top + window.scrollY - 68
      glideTo(top + ((active + 0.5) / features.length) * scrollable())
    }
  }

  function onKeydown(event: KeyboardEvent) {
    const moves: Record<string, number> = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: features.length - 1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    select(moves[event.key], true)
  }

  onMount(() => {
    let queued = false
    const update = () => {
      queued = false
      if (!track || !window.matchMedia(pinned).matches) return
      const range = scrollable()
      if (!(range > 0)) return
      const offset = 68 - track.getBoundingClientRect().top
      const progress = Math.min(0.9999, Math.max(0, offset / range))
      active = Math.min(features.length - 1, Math.floor(progress * features.length))
    }
    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  })
</script>

<div class="tour-track" bind:this={track} data-steps={features.length}>
  <div class="tour-pin">
    <div class="tour">
      <div class="tour-side">
        <h2 class="section-heading">{title}</h2>
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
            </button>
          {/each}
        </div>
        <p class="tour-detail">{features[active].detail}</p>
      </div>

      <div class="tour-stage" id="tour-panel" role="tabpanel" aria-labelledby={`tour-tab-${features[active].key}`}>
        {#each features as feature, index (feature.key)}
          <div class="tour-shot" class:active={index === active} aria-hidden={index !== active}>
            <ProductPicture name={feature.shot} alt={index === active ? feature.alt : ''} width={1200} height={760} eager={index === 0} />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>
