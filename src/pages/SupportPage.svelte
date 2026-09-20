<script lang="ts">
  import FaqItem from '../FaqItem.svelte'
  import { reveal } from '../lib/motion'
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'

  const facts = $derived(productFacts(productState.status))
  const requestUrl = accountUrl('/support')
</script>

<section class="page-hero compact-page-hero support-hero">
  <h1>How can we help?</h1>
  <p class="intro">Get help with Sesame or report a bug.</p>
</section>

<section class="section support-section" aria-label="Contact support">
  <div class="support-intake" id="new-request" use:reveal>
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

  <aside class="support-guide" aria-label="Before you send a request" use:reveal>
    <div><h2>What to include</h2><ul><li>Your app and system version</li><li>The steps that led to the problem</li><li>The error message, if there is one</li></ul></div>
    <div><h2>Keep private details out</h2><p>Never send passwords, security codes, vault files, exports, recovery kits, or keys.</p></div>
  </aside>
</section>

<section class="section support-faq">
  <div class="faq-block" use:reveal>
    <h2>Common questions</h2>
    <FaqItem question="Can I download Sesame now?">
      <p>{facts.supportDownloadAnswer}</p>
    </FaqItem>
    <FaqItem question="Does Sesame run on my computer?">
      <p>Windows 10 and 11 on x64, and Linux through deb, rpm, and AppImage packages. The releases page lists every official installer with its checksum.</p>
    </FaqItem>
    <FaqItem question="How do I update?">
      <p>Sesame checks for updates itself. Builds from 0.1.1 on update from inside the app; if you are still on 0.1.0, install a newer version by hand once.</p>
    </FaqItem>
    <FaqItem question="What can I import?">
      <p>{IMPORT_FORMAT_COUNT} formats from Bitwarden, 1Password, major browsers, and other password managers.</p>
    </FaqItem>
    <FaqItem question="Does Sync work yet?">
      {#if facts.syncAvailable}
        <p>Yes. Sesame Sync is available for accounts that have it enabled.</p>
      {:else}
        <p>No. The <a href="/roadmap#sync">roadmap</a> lists what has to pass first.</p>
      {/if}
    </FaqItem>
    <FaqItem question="Is there a mobile app or browser extension?">
      <p>No mobile app yet. The browser helper is not in stores.</p>
    </FaqItem>
    <FaqItem question="Where is my vault stored?">
      <p>On your computer.</p>
    </FaqItem>
    <FaqItem question="Has Sesame been independently reviewed?">
      <p>Not yet. The <a href="/security">security page</a> shows what that means for the current release.</p>
    </FaqItem>
  </div>
</section>
