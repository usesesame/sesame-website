<script lang="ts">
  import { reveal } from '../lib/motion'
  import { syncPricePhrase } from '../lib/product-facts'
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
    <div id="today" use:reveal><h2>Available to test</h2><p>The Windows and Linux app stores logins in a local vault. You can import records, search them, check passwords, and create or restore backups.</p></div>
    <div id="backups" use:reveal><h2>Backup compatibility</h2><p>Conversion for older backups is implemented. Restore and restart tests in the installed Windows and Linux apps are still required before the compatibility work is complete. Keep the original backup file.</p></div>
    <div id="gates" use:reveal><h2>Release checks</h2><p>Planned release checks cover installation, updates, backup restoration, and restart on Windows and Linux. Signing Windows installers is also planned.</p></div>
    <div id="deployment" use:reveal><h2>Deployment</h2><p>The website validates a new build before replacing the live site. If validation fails, the current site stays live.</p></div>
    <div id="baseline" use:reveal><h2>Security review</h2><p>Sesame has not had an independent security audit. The review plan covers the vault, browser integration, account service, and release process. Use test data for now.</p></div>
    <div id="passkeys" use:reveal><h2>Passkeys</h2><p>Saving and using passkeys in Sesame is planned. The storage and browser design needs review before implementation. There is no release date.</p></div>
    <div id="sync" use:reveal><h2>Sesame Sync</h2><p>Sync has preview code, but it is disabled in shipping builds. It will stay unavailable until its security review and release checks pass.</p></div>
    <div id="browser" use:reveal><h2>Browser extension</h2><p>Chrome, Edge, and Firefox packages build from source. Store submission, signed native-host installation, and clean-profile lifecycle checks remain before public distribution.</p></div>
    <div id="payment" use:reveal><h2>Payment</h2><p>The app is free. Managed Sync is planned at {syncPricePhrase('code')}.</p></div>
    <div id="later" use:reveal><h2>Later</h2><p>macOS support and unlock with a security key need design review. Post-quantum device enrollment has a prototype and a decision packet awaiting review. None of these are available in shipping builds.</p></div>
  </article>
</section>
