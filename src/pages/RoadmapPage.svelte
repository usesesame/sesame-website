<script lang="ts">
  import { syncPricePhrase } from '../lib/product-facts'
</script>

<section class="page-hero compact-page-hero">
  <h1>What is built, and what is next.</h1>
  <p class="intro">The local vault is the product, and it is free. Accounts, Sync, and the browser extension are separate systems with their own release gates.</p>
</section>
<section class="section document-section roadmap-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#today">Today</a>
    <a href="#sync">Sesame Sync</a>
    <a href="#browser">Browser extension</a>
    <a href="#payment">Payment</a>
  </nav>
  <article class="document-copy">
    <div id="today"><h2>Available now</h2><p>The desktop app for Windows and Linux can create, edit, search, import, check, back up, restore, export, and delete a local vault without a Sesame account.</p></div>
    <div id="sync"><h2>Sesame Sync</h2><p>Sync is implemented behind release gates but disabled in the current desktop build. It will remain unavailable until the protocol, device approval, key handling, conflict behavior, and recovery paths complete independent review.</p></div>
    <div id="browser"><h2>Browser extension</h2><p>Chrome, Edge, and Firefox packages build from source. Store submission, signed native-host installation, and clean-profile lifecycle checks remain before public distribution.</p></div>
    <div id="payment"><h2>Payment</h2><p>The local app is free and licensed under AGPL-3.0-or-later. Managed Sync is planned at {syncPricePhrase('code')}. Local vault access, backup, export, and recovery do not require payment.</p></div>
  </article>
</section>
