<script lang="ts">
  import { syncPricePhrase } from '../lib/product-facts'
</script>

<section class="page-hero compact-page-hero">
  <h1>What is built, and what is next.</h1>
  <p class="intro">The local vault is the product. Accounts, Sync, and the browser extension are separate systems with their own release gates.</p>
</section>
<section class="section document-section roadmap-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#today">Today</a>
    <a href="#backups">Backup compatibility</a>
    <a href="#gates">Release gates</a>
    <a href="#deployment">Deployment</a>
    <a href="#baseline">Security baseline</a>
    <a href="#passkeys">Passkeys</a>
    <a href="#sync">Sesame Sync</a>
    <a href="#browser">Browser extension</a>
    <a href="#payment">Payment</a>
    <a href="#later">Later</a>
  </nav>
  <article class="document-copy">
    <div id="today"><h2>Available now</h2><p>The desktop app for Windows and Linux can create, edit, search, import, check, back up, restore, export, and delete a local vault.</p></div>
    <div id="backups"><h2>Backup compatibility</h2><p>Backups from every released Sesame version will keep opening as the app moves on. An upgrade authenticates the old backup, converts it, reopens and verifies the converted copy, and only then replaces the active vault. The original backup file is never modified, and a failed upgrade leaves the current vault untouched. The conversion is implemented; the release gate below is its last step.</p></div>
    <div id="gates"><h2>Release gates</h2><p>A release will not publish until every supported historical backup completes a restore and restart on the packaged app, on Windows and Linux. Production Windows installers will also be Authenticode signed.</p></div>
    <div id="deployment"><h2>Deployment</h2><p>Server deployments will pin image digests, prove health before switching traffic, and keep a rehearsed rollback. Website deploys become atomic: a failed check leaves the current site live.</p></div>
    <div id="baseline"><h2>Security baseline</h2><p>The independent review starts once the release and deployment gates hold. Before it, the baseline work hardens Linux key storage, adds fuzzing for vault parsing, sets a policy for accepting dependencies, and publishes the threat model.</p></div>
    <div id="passkeys"><h2>Passkeys</h2><p>In development and planned for the coming releases.</p></div>
    <div id="sync"><h2>Sesame Sync</h2><p>Sync is implemented behind release gates but disabled in the current desktop build. It will remain unavailable until the protocol, device approval, key handling, conflict behavior, and recovery paths complete independent review.</p></div>
    <div id="browser"><h2>Browser extension</h2><p>Chrome, Edge, and Firefox packages build from source. Store submission, signed native-host installation, and clean-profile lifecycle checks remain before public distribution.</p></div>
    <div id="payment"><h2>Payment</h2><p>The app is free. Managed Sync is planned at {syncPricePhrase('code')}.</p></div>
    <div id="later"><h2>Later</h2><p>macOS builds, hardware-backed unlock, and Sync protocol work come after these gates. Threshold recovery and post-quantum enrollment wait until their design has been through review.</p></div>
  </article>
</section>
