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
    <div id="today"><h2>The Windows app owns the vault.</h2><p>Vault creation, unlocking, search, TOTP, imports, checks, backups, restore, export, and deletion run in the desktop app. A Sesame account is optional and does not unlock or identify a vault.</p></div>
    <div id="sync"><h2>Sesame Sync</h2><p>The ciphertext-only protocol is built. A new device is approved by an existing one, which seals the vault key to that device. Changes are signed by the device that made them, and conflicting edits pause for review instead of overwriting each other.</p><p><strong>Not available:</strong> no desktop vault uploads to Sesame today. None of it is reachable in a released build, and the service will not open until an independent review of the protocol, key handling, and recovery paths is complete.</p></div>
    <div id="browser"><h2>Browser extension</h2><p>The extension talks to the desktop app over native messaging rather than a local server. It fills only after you act in the extension and approve in the desktop app; it never submits the page and never stores a credential. Saved cards follow the same per-fill approval, on HTTPS pages only. The inline control stays off until you grant host permission, and you can pause or revoke it at any time.</p><p>Chrome, Edge, and Firefox archives already build reproducibly, with recorded digests and a fixed extension identity that the native host manifest must match. What is left: store submission, a signed installer for the native host, and clean-profile install and removal checks.</p></div>
    <div id="payment"><h2>Payment</h2><p>Sesame Sync is planned at {syncPricePhrase('code')}, and it is the only thing Sesame intends to charge for. There is no paid edition of the application: it is AGPL software, and a feature will not be moved behind a payment.</p><p>Payment can gate new hosted syncing activity, and nothing else. It can never gate local vault access, unlocking, backup, export, or recovery. Because the sync service is published under the same licence, you can always host it yourself. Paying Sesame is a convenience, not a requirement.</p></div>
  </article>
</section>
