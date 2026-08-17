<script lang="ts">
  export let src: string
  export let alt: string
  export let title: string
  export let caption: string
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
    aria-label={`View ${title} screenshot full size`}
    disabled={unavailable}
    on:click={openPreview}
  >
    <span class="product-shot-frame">
    {#if !unavailable}
      <img {src} {alt} loading="lazy" decoding="async" on:error={() => (unavailable = true)} />
    {:else}
      <div class="screenshot-pending" role="img" aria-label={`${title} screenshot pending`}>
        <img src="/favicon.svg" alt="" />
        <strong>Sanitised beta screenshot pending</strong>
        <span>The product exists; this public capture still needs its test data checked.</span>
      </div>
    {/if}
    </span>
  </button>
  <figcaption><strong>{title}</strong><span>{caption}</span><small>Click to view full size.</small></figcaption>
</figure>

<dialog
  class="screenshot-dialog"
  bind:this={previewDialog}
  aria-label={`${title} full-size screenshot`}
  on:click={closeFromBackdrop}
  on:close={restorePreviewTrigger}
>
  <div class="screenshot-dialog-panel">
    <div class="screenshot-dialog-head">
      <div><strong>{title}</strong><span>Fictional test data</span></div>
      <button class="screenshot-dialog-close" type="button" aria-label={`Close ${title} screenshot preview`} on:click={closePreview}>Close</button>
    </div>
    <img {src} {alt} />
  </div>
</dialog>
