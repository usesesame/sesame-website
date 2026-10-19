<script lang="ts">
  import { onMount } from 'svelte'
  import { chromeExtensionNeeds, extensionSentence, extensionState } from '../lib/extension.svelte'
  import FaqItem from '../FaqItem.svelte'
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { loadExtensions, productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'

  const facts = $derived(productFacts(productState.status))
  const requestUrl = accountUrl('/support')
  const extension = $derived(extensionState())

  onMount(() => {
    void loadExtensions()
  })
</script>

<section class="page-hero compact-page-hero support-hero">
  <h1>How can we help?</h1>
</section>

<section class="section support-section" aria-label="Contact support">
  <div class="support-intake" id="new-request">
    <h2>Send a request</h2>
    {#if requestUrl}
      <p class="support-description">Tell us what happened and what you expected. You can send a request as a guest or sign in to keep a request history.</p>
      <div class="support-action">
        <a class="button" href={requestUrl}>Open the support form</a>
        <p>The form accepts text only.</p>
      </div>
    {:else}
      <p class="support-description">The support form is unavailable on this site. For security problems, follow the project's security policy. Use repository issues for other questions and bugs.</p>
      <div class="support-action"><a class="button button-soft" href="/security">Read security guidance</a></div>
    {/if}
  </div>

  <aside class="support-guide" aria-label="Before you send a request">
    <div><h2>What to include</h2><ul><li>Your app and system version</li><li>The steps that led to the problem</li><li>The error message, if there is one</li></ul></div>
    <div><h2>Keep private details out</h2><p>Never send passwords, security codes, vault files, exports, recovery kits, or keys.</p></div>
  </aside>
</section>

<section class="section support-faq">
  <div class="faq-block">
    <h2>Common questions</h2>
    <FaqItem question="Can I download Sesame now?">
      <p>{facts.supportDownloadAnswer}</p>
    </FaqItem>
    <FaqItem question="Does Sesame run on my computer?">
      <p>Sesame runs on 64-bit Windows 10 and 11, and on Linux through deb, rpm, and AppImage packages. The releases page lists every official installer with its checksum.</p>
    </FaqItem>
    <FaqItem question="How do I update?">
      <p>On Windows, Sesame updates itself from inside the app. On Linux, download new versions from the releases page.</p>
    </FaqItem>
    <FaqItem question="What can I import?">
      <p>Sesame imports {IMPORT_FORMAT_COUNT} formats from Bitwarden, 1Password, the major browsers, and other password managers.</p>
    </FaqItem>
    <FaqItem question="Does Sync work yet?">
      {#if facts.syncAvailable}
        <p>Yes. Sesame Sync is available for accounts that have it enabled.</p>
      {:else}
        <p>Yes, on a server you run. Sync is in the latest desktop release and is off until you turn it on. The hosted Sesame service does not offer it yet, and the <a href="/roadmap#sync">roadmap</a> has the details.</p>
      {/if}
    </FaqItem>
    <FaqItem question="Is there a mobile app or browser extension?">
      <p>There is no mobile app yet. {extensionSentence(extension)}{#if extension.status === 'published'} <a href={extension.listingUrl} rel="noreferrer">Open the listing</a>.{/if} {chromeExtensionNeeds}</p>
    </FaqItem>
    <FaqItem question="Where is my vault stored?">
      <p>Your vault is a file on your computer.</p>
    </FaqItem>
    <FaqItem question="Has Sesame been independently reviewed?">
      <p>Not yet. The <a href="/security">security page</a> shows what that means for the current release.</p>
    </FaqItem>
  </div>
</section>
