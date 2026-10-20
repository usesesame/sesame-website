<script lang="ts">
  import { onMount } from 'svelte'
  import { loadExtensions, loadStatus, productState } from '../lib/product-state.svelte'
  import { productFacts, syncPricePhrase } from '../lib/product-facts'
  import { chromeExtensionNeeds, extensionSentence, extensionState } from '../lib/extension.svelte'
  import { extensionSourceUrl, selfHostingUrl } from '../lib/source-links'

  const facts = $derived(productFacts(productState.status))
  const extension = $derived(extensionState())

  onMount(() => {
    void loadStatus()
  })

  onMount(() => {
    void loadExtensions()
  })
</script>

<section class="page-hero compact-page-hero">
  <h1>What works and what is planned</h1>
</section>
<section class="section roadmap-section">
  <div id="today" class="roadmap-row"><p class="roadmap-state" data-state="available">Available</p><h2>Desktop vault</h2><div class="roadmap-copy"><p>The Windows and Linux app stores logins in a local vault. You can import records, search them, check passwords, and create or restore backups.</p></div></div>
  <div id="backups" class="roadmap-row"><p class="roadmap-state" data-state="available">Available</p><h2>Backup compatibility</h2><div class="roadmap-copy"><p>Sesame converts backups from older versions. Before each official release, it restores every older backup format on Windows and Linux to check that they still open. Keep your original backup file anyway.</p></div></div>
  <div id="gates" class="roadmap-row"><p class="roadmap-state" data-state="available">Available</p><h2>Release checks</h2><div class="roadmap-copy"><p>Before each official release, the build installs the real package on Windows and Linux, restores every supported older backup, restarts the app, and makes a new backup. Signing the Windows installer is still planned.</p></div></div>
  <div id="deployment" class="roadmap-row"><p class="roadmap-state" data-state="available">Available</p><h2>Deployment</h2><div class="roadmap-copy"><p>The website checks a new build before it replaces the live site, and if the check fails, the current site stays up.</p></div></div>
  <div id="sync" class="roadmap-row"><p class="roadmap-state" data-state="available">Available</p><h2>Sesame Sync</h2><div class="roadmap-copy"><p class="sync-status">{facts.syncAvailabilitySentence}</p><p>{#if facts.syncAvailable}Sync remains optional, and your vault keeps working locally without it.{:else}Sync is off until you turn it on. Then it syncs your encrypted vault between your devices through a server you run, and it has not had an independent security review. The <a href={selfHostingUrl} rel="noreferrer">self-hosting guide</a> explains how to run the server.{/if}</p></div></div>
  <div id="browser" class="roadmap-row"><p class="roadmap-state" data-state={extension.status === 'published' ? 'available' : 'progress'}>{extension.status === 'published' ? 'Available' : 'In progress'}</p><h2>Browser extension</h2><div class="roadmap-copy"><p>{extensionSentence(extension)}{#if extension.status === 'published'} <a href={extension.listingUrl} rel="noreferrer">Open the listing</a>.{/if} {chromeExtensionNeeds} An experimental Firefox version can be built from <a href={extensionSourceUrl} rel="noreferrer">the source on GitHub</a>.</p></div></div>
  <div id="baseline" class="roadmap-row"><p class="roadmap-state" data-state="planned">Planned</p><h2>Security review</h2><div class="roadmap-copy"><p>Sesame has not had an independent security audit yet. The planned review covers the vault, the browser integration, the account service, and the release process.</p></div></div>
  <div id="passkeys" class="roadmap-row"><p class="roadmap-state" data-state="planned">Planned</p><h2>Passkeys</h2><div class="roadmap-copy"><p>We plan to let you save and use passkeys in Sesame. The design for storing them and using them in the browser needs a review first, so there is no date yet.</p></div></div>
  <div id="payment" class="roadmap-row"><p class="roadmap-state" data-state="planned">Planned</p><h2>Payment</h2><div class="roadmap-copy"><p>The app is free. Hosted Sync is planned at {syncPricePhrase('code')}.</p></div></div>
  <div id="later" class="roadmap-row"><p class="roadmap-state" data-state="planned">Planned</p><h2>Later</h2><div class="roadmap-copy"><p>macOS support and unlocking with a security key need a design review first. None of these are in released builds.</p></div></div>
</section>
