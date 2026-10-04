<script lang="ts">
  import { onMount } from 'svelte'
  import { loadStatus, productState } from '../lib/product-state.svelte'
  import { productFacts, syncPricePhrase } from '../lib/product-facts'

  const facts = $derived(productFacts(productState.status))

  onMount(() => {
    void loadStatus()
  })
</script>

<section class="page-hero compact-page-hero">
  <h1>What works and what is planned</h1>
  <p class="intro">The desktop vault is available to test. Sync and other planned features need more testing and review before release.</p>
</section>
<section class="section document-section roadmap-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#today">Today</a>
    <a href="#backups">Backup compatibility</a>
    <a href="#gates">Release checks</a>
    <a href="#deployment">Deployment</a>
    <a href="#baseline">Security review</a>
    <a href="#passkeys">Passkeys</a>
    <a href="#sync">Sesame Sync</a>
    <a href="#browser">Browser extension</a>
    <a href="#payment">Payment</a>
    <a href="#later">Later</a>
  </nav>
  <article class="document-copy">
    <div id="today"><p class="roadmap-state" data-state="available">Available</p><h2>Desktop vault</h2><p>The Windows and Linux app stores logins in a local vault. You can import records, search them, check passwords, and create or restore backups.</p></div>
    <div id="backups"><p class="roadmap-state" data-state="available">Available</p><h2>Backup compatibility</h2><p>Sesame converts backups from older versions. Before each official release, it restores every older backup format on Windows and Linux to check that they still open. Keep your original backup file anyway.</p></div>
    <div id="gates"><p class="roadmap-state" data-state="available">Available</p><h2>Release checks</h2><p>Before each official release, the build installs the real package on Windows and Linux, restores every supported older backup, restarts the app, and makes a new backup. Signing the Windows installer is still planned.</p></div>
    <div id="deployment"><p class="roadmap-state" data-state="available">Available</p><h2>Deployment</h2><p>The website checks a new build before it replaces the live site, and if the check fails, the current site stays up.</p></div>
    <div id="baseline"><p class="roadmap-state" data-state="planned">Planned</p><h2>Security review</h2><p>Sesame has not had an independent security audit yet. The planned review covers the vault, the browser integration, the account service, and the release process.</p></div>
    <div id="passkeys"><p class="roadmap-state" data-state="planned">Planned</p><h2>Passkeys</h2><p>We plan to let you save and use passkeys in Sesame. The design for storing them and using them in the browser needs a review first, so there is no date yet.</p></div>
    <div id="sync"><p class="roadmap-state" data-state={facts.syncAvailable ? 'available' : 'progress'}>{facts.syncAvailable ? 'Available' : 'In progress'}</p><h2>Sesame Sync</h2><p class="sync-status">{facts.syncAvailabilitySentence}</p><p>{facts.syncAvailable ? 'Sync remains optional, and your vault keeps working locally without it.' : 'Sync has preview code, but it is turned off in released builds.'}</p></div>
    <div id="browser"><p class="roadmap-state" data-state="progress">In progress</p><h2>Browser extension</h2><p>You can build the Chrome extension and an experimental Firefox version from source. Before it goes into the browser stores, it still needs store review, a signed installer for the part that talks to the desktop app, and install tests on fresh browser profiles.</p></div>
    <div id="payment"><p class="roadmap-state" data-state="planned">Planned</p><h2>Payment</h2><p>The app is free. Managed Sync is planned at {syncPricePhrase('code')}.</p></div>
    <div id="later"><p class="roadmap-state" data-state="planned">Planned</p><h2>Later</h2><p>macOS support and unlocking with a security key need a design review first. Post-quantum device enrollment has a prototype that is waiting for review. None of these are in released builds.</p></div>
  </article>
</section>
