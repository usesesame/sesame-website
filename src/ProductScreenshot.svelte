<script lang="ts">
  import ProductPicture from './ProductPicture.svelte'

  export let name: string
  export let alt: string
  export let width: number
  export let height: number
  export let title = ''
  export let eager = false
  let unavailable = false
  let previewDialog: HTMLDialogElement
  let previewTrigger: HTMLButtonElement

  function openPreview() {
    if (!previewDialog?.open) previewDialog?.showModal()
  }

  function closePreview() {
    previewDialog?.close()
  }

  function closeFromBackdrop(event: MouseEvent) {
    if (event.target === previewDialog) closePreview()
  }

  function restorePreviewTrigger() {
    previewTrigger?.focus()
  }
</script>

<figure class="product-shot" class:shot-unavailable={unavailable}>
  <button
    class="product-shot-trigger"
    type="button"
    bind:this={previewTrigger}
    aria-label={`Enlarge the ${title || alt} screenshot`}
    disabled={unavailable}
    on:click={openPreview}
  >
    <span class="product-shot-frame" style={`aspect-ratio: ${width} / ${height}`}>
    {#if !unavailable}
      <ProductPicture {name} {alt} {width} {height} {eager} onFailure={() => { unavailable = true }} />
    {:else}
      <div class="screenshot-pending" role="img" aria-label={`${title || alt} screenshot pending`}>
        <img src="/favicon.svg" alt="" width="512" height="512" />
        <strong>Screenshot on its way</strong>
        <span>This one is being replaced with checked test data.</span>
      </div>
    {/if}
    </span>
  </button>
</figure>

<dialog
  class="screenshot-dialog"
  bind:this={previewDialog}
  aria-label={`${title || alt} full-size screenshot`}
  on:click={closeFromBackdrop}
  on:close={restorePreviewTrigger}
>
  <div class="screenshot-dialog-panel">
    <div class="screenshot-dialog-head">
      <div>{#if title}<strong>{title}</strong>{/if}<span>Fictional test data</span></div>
      <button class="screenshot-dialog-close" type="button" aria-label={`Close ${title || alt} screenshot preview`} on:click={closePreview}>Close</button>
    </div>
    <ProductPicture {name} {alt} {width} {height} />
  </div>
</dialog>
