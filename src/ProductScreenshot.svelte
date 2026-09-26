<script lang="ts">
  export let src: string
  export let darkSrc = ''
  export let alt: string
  export let title = ''
  export let caption = ''
  export let eager = false
  let unavailable = false
  let darkFailed = false
  $: darkAvailable = Boolean(darkSrc) && !darkFailed
  let previewDialog: HTMLDialogElement
  let previewTrigger: HTMLButtonElement

  function handleImageError() {
    if (darkAvailable) {
      darkFailed = true
      return
    }
    unavailable = true
  }

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
    aria-label={`View ${title || alt} screenshot full size`}
    disabled={unavailable}
    on:click={openPreview}
  >
    <span class="product-shot-frame">
    {#if !unavailable}
      {#if darkAvailable}
        <picture>
          <source srcset={darkSrc} media="(prefers-color-scheme: dark)" />
          <img {src} {alt} width="1440" height="900" loading={eager ? 'eager' : 'lazy'} decoding="async" on:error={handleImageError} />
        </picture>
      {:else}
        <img {src} {alt} width="1440" height="900" loading={eager ? 'eager' : 'lazy'} decoding="async" on:error={handleImageError} />
      {/if}
    {:else}
      <div class="screenshot-pending" role="img" aria-label={`${title || alt} screenshot pending`}>
        <img src="/favicon.svg" alt="" width="512" height="512" />
        <strong>Screenshot on its way</strong>
        <span>This one is being replaced with checked test data.</span>
      </div>
    {/if}
    </span>
  </button>
  <figcaption>{#if title}<strong>{title}</strong>{/if}{#if caption}<span>{caption}</span>{/if}<small>Click to view full size.</small></figcaption>
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
    {#if darkAvailable}
      <picture>
        <source srcset={darkSrc} media="(prefers-color-scheme: dark)" />
        <img {src} {alt} width="1440" height="900" />
      </picture>
    {:else}
      <img {src} {alt} width="1440" height="900" />
    {/if}
  </div>
</dialog>
