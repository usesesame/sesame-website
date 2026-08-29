<script lang="ts">
  import { IMPORT_FORMAT_COUNT } from '../lib/product-facts'
  import { licenceUrl } from '../lib/source-links'
</script>

<section class="page-hero">
  <h1>What Sesame handles, and what it does not.</h1>
  <p class="intro">The desktop application is the only Sesame product that handles vault contents. The website and API publish product information and release metadata.</p>
</section>

<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#boundary">Product boundary</a>
    <a href="#local">Local vault</a>
    <a href="#service">Website and API</a>
    <a href="#source">Open source</a>
    <a href="#limitations">Current limitations</a>
  </nav>
  <article class="document-copy">
    <div id="boundary"><h2>The vault stays with the desktop app</h2><p>Creating, unlocking, importing, checking, backing up, restoring, exporting, and deleting a local vault does not depend on a Sesame account or service.</p></div>
    <div id="local"><h2>Data kept on your device</h2><p>The desktop app keeps vault files encrypted and opens them with the unlock method you configure. These values are not sent to the website or API:</p><ul><li>Vault items and document attachments</li><li>Master passwords, derived keys, and recovery material</li><li>Imports from {IMPORT_FORMAT_COUNT} supported formats</li><li>2FA seeds, backup codes, and recovery notes</li></ul></div>
    <div id="service"><h2>Data handled by the website and API</h2><p>The service publishes product and release information. If you create a website account, it stores the account email, password hash, and revocable sessions separately from any vault.</p><p>Sync is disabled in the current release. The packaged browser extension stores no credentials, never submits a form, and requires approval from the unlocked desktop app for each fill.</p></div>
    <div id="source"><h2>Read the implementation</h2><p>The desktop app, vault core, optional server, portals, website, and browser extension are published under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>. Release pages link source and build evidence to the shipped version.</p></div>
    <div id="limitations"><h2>Current limitations</h2><p>The independent security review is not complete. Sync is disabled, and the browser extension is not published in browser stores. Use test data while evaluating this beta.</p></div>
  </article>
</section>
