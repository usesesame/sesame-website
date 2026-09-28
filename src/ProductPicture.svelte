<script lang="ts">
  export let name: string
  export let alt: string
  export let width: number
  export let height: number
  export let eager = false
  export let onFailure: () => void = () => {}

  let darkFailed = false
  $: base = `/screenshots/${name}`

  function handleError() {
    if (!darkFailed && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      darkFailed = true
      return
    }
    onFailure()
  }
</script>

<picture>
  {#if !darkFailed}
    <source type="image/avif" media="(prefers-color-scheme: dark)" srcset={`${base}-dark.avif`} />
    <source type="image/png" media="(prefers-color-scheme: dark)" srcset={`${base}-dark.png`} />
  {/if}
  <source type="image/avif" srcset={`${base}.avif`} />
  <img src={`${base}.png`} {alt} {width} {height} loading={eager ? 'eager' : 'lazy'} decoding="async" on:error={handleError} />
</picture>
