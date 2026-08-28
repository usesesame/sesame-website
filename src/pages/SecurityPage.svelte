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
    <div id="boundary"><h2>The vault stays with the desktop app.</h2><p>Vault creation, unlocking, encryption, import, TOTP generation, password checks, backups, restore, export, and deletion run locally. Opening a local vault does not depend on a Sesame account or service.</p></div>
    <div id="local"><h2>Data kept on your device</h2><p>Vault content is encrypted and authenticated with XChaCha20-Poly1305. Argon2id derives the wrapping key from your master password, from a separately generated recovery kit, and, if you enable it, from a PIN combined with a random value stored under Windows DPAPI. Each of these unlock methods wraps the same vault key independently, so the vault file itself holds only ciphertext, never a password or a recovery kit. Windows Hello, when you turn it on, adds a further wrap: the vault key is sealed to a device key held in the Windows Passport key store, which releases it only after a fresh Hello gesture. Sesame sees that gesture succeed or fail and never receives biometric data.</p><ul><li>Vault contents, encrypted vault files, and document attachments</li><li>Master passwords, derived keys, and recovery material</li><li>Imported password-manager, browser, and authenticator exports, in {IMPORT_FORMAT_COUNT} supported formats</li><li>TOTP seeds, backup codes, and recovery notes</li></ul></div>
    <div id="service"><h2>Data handled by the website and API</h2><p>The service publishes product information and release metadata. It also holds a separate website account: an email address, a password hash, and a revocable session. It has no vault endpoint and will not accept vault fields, imports, or vault credentials.</p><p>A future Sync service may retain encrypted opaque records and limited routing metadata. It is not enabled in this beta. The browser extension is built and packaged for Chrome, Edge, and Firefox but is not published in any store, and it needs the signed native host that ships with a desktop installer. Filling a form requires a user action in the extension and an approval from the unlocked desktop app; the extension stores no credential and never submits the page. Saved cards fill on the same terms, on HTTPS pages only. The desktop app resolves card values after a per-fill approval, and a card field is filled only in the page's own top-level frame or in a Stripe payment frame, so a cross-origin frame cannot claim a card.</p></div>
    <div id="source"><h2>You do not have to take our word for this</h2><p>Every claim on this page describes code you can read. Sesame is published under the <a href={licenceUrl} rel="noreferrer">GNU Affero General Public License v3.0 or later</a>: the Windows app and the Rust vault core, the vault-blind API, the account and administration portals, this website, and the browser extension. The encryption and key handling described above live in the vault core, so the design and the shipped behaviour can be compared rather than trusted.</p><p>The browser extension's store archives are reproducible. The same commit and Node version produce the same SHA-256 digests, and those digests are published beside the packages, so an upload can be checked against the source it claims to come from.</p><p>The AGPL also binds a hosted deployment: anyone who runs a modified Sesame service has to offer its corresponding source. The Sesame name and artwork are handled separately by the trademark policy, which is what stops a modified build from presenting itself as official.</p></div>
    <div id="limitations"><h2>Current limitations</h2><p>Sesame has not completed an independent security review. A website account is optional: it manages licences and connected devices, and it does not store vault data. Sync is not enabled, and the browser extension is built but not yet published in the Chrome, Edge, or Firefox stores.</p></div>
  </article>
</section>
