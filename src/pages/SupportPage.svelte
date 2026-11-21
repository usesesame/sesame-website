<script lang="ts">
  import { onMount } from 'svelte'
  import { chromeExtensionNeeds, extensionSentence, extensionState } from '../lib/extension.svelte'
  import FaqItem from '../FaqItem.svelte'
  import { buildIn } from '../lib/build-in'
  import { IMPORT_FORMAT_COUNT, productFacts } from '../lib/product-facts'
  import { loadExtensions, productState } from '../lib/product-state.svelte'
  import { accountUrl } from '../lib/runtime-config'
  import { securityPolicyUrl, sourceOrg } from '../lib/source-links'
  import { supportGroups } from '../lib/support-guides'

  const facts = $derived(productFacts(productState.status))
  const requestUrl = accountUrl('/support')
  const extension = $derived(extensionState())

  let query = $state('')
  const words = $derived(query.toLowerCase().split(/\s+/).filter(Boolean))
  const shownGroups = $derived(
    supportGroups
      .map((group) => ({
        ...group,
        guides: group.guides.filter((guide) => {
          const text = `${guide.title} ${guide.summary} ${guide.steps.join(' ')} ${guide.note ?? ''}`.toLowerCase()
          return words.every((word) => text.includes(word))
        }),
      }))
      .filter((group) => group.guides.length > 0),
  )
  const shownCount = $derived(shownGroups.reduce((total, group) => total + group.guides.length, 0))

  onMount(() => {
    void loadExtensions()
  })
</script>

<section class="page-hero support-hero">
  <h1>How can we help?</h1>
  <p class="intro">Start with the guides. Each one lists the steps to take in the app, and if none of them solves it you can send us a request.</p>
  <div class="guide-search">
    <label for="guide-search">Search the guides</label>
    <input id="guide-search" type="text" role="searchbox" enterkeyhint="search" bind:value={query} placeholder="Try recovery kit, extension, or backup" autocomplete="off" />
    <p aria-live="polite">{#if words.length}{shownCount === 0 ? 'No guide matches that.' : shownCount === 1 ? 'One guide matches.' : `${shownCount} guides match.`}{/if}</p>
  </div>
</section>

<section class="chapter guides" aria-label="Guides">
  {#if shownCount === 0}
    <p class="guides-empty">No guide covers that yet. <a href="#new-request">Send a request</a> and tell us what you were trying to do.</p>
  {/if}
  {#each shownGroups as group (group.key)}
    <section class="guide-group" aria-labelledby={`guide-group-${group.key}`} use:buildIn>
      <h2 id={`guide-group-${group.key}`}>{group.title}</h2>
      <div class="guide-list">
        {#each group.guides as guide (guide.key)}
          <details class="guide" id={guide.key} open={words.length > 0 && shownCount <= 2}>
            <summary>
              <span class="guide-title">{guide.title}</span>
              <span class="guide-summary">{guide.summary}</span>
              <span class="faq-toggle" aria-hidden="true"><span class="faq-bar"></span><span class="faq-bar"></span></span>
            </summary>
            <ol class="guide-steps">
              {#each guide.steps as step (step)}<li>{step}</li>{/each}
            </ol>
            {#if guide.note}<p class="guide-note">{guide.note}</p>{/if}
          </details>
        {/each}
      </div>
    </section>
  {/each}
</section>

<section class="chapter support-section" aria-label="Contact support">
  <div class="support-intake" id="new-request" use:buildIn>
    <h2>Send a request</h2>
    {#if requestUrl}
      <p class="support-description">Tell us what happened and what you expected. You can send a request as a guest or sign in to keep a request history.</p>
      <div class="support-action">
        <a class="button button-xl" href={requestUrl}>Open the support form</a>
        <p>The form accepts text only.</p>
      </div>
    {:else}
      <p class="support-description">The support form is unavailable on this site. For security problems, follow the project's security policy. Use repository issues for other questions and bugs.</p>
      <div class="support-action"><a class="button button-xl button-soft" href="/security">Read security guidance</a></div>
    {/if}
    <dl class="support-routes">
      <div><dt>A bug you can reproduce</dt><dd>Open an issue in the <a href={sourceOrg} rel="noreferrer">repository</a> for the part that failed, and use made-up data in it.</dd></div>
      <div><dt>A security problem</dt><dd>Report it privately through the <a href={securityPolicyUrl} rel="noreferrer">security policy</a>, never in a public issue.</dd></div>
    </dl>
  </div>

  <aside class="support-guide" aria-label="Before you send a request" use:buildIn>
    <div><h2>What to include</h2><ul><li>Your app and system version</li><li>The steps that led to the problem</li><li>The error message, if there is one</li></ul></div>
    <div><h2>Keep private details out</h2><p>Never send passwords, security codes, vault files, exports, recovery kits, or keys.</p></div>
  </aside>
</section>

<section class="chapter support-faq">
  <div class="faq-block" use:buildIn>
    <h2>Common questions</h2>
    <FaqItem question="Can I download Sesame now?">
      <p>{facts.supportDownloadAnswer}</p>
    </FaqItem>
    <FaqItem question="Does Sesame run on my computer?">
      <p>Sesame runs on 64-bit Windows 10 and 11, and on Linux through deb, rpm, and AppImage packages. The releases page lists every official installer with its checksum.</p>
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
