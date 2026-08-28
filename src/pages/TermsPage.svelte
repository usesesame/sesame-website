<script lang="ts">
  import { LEGAL_UPDATED, LEGAL_VERSION } from '../lib/legal'
  import { productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'

  const facts = $derived(productFacts(productState.status))
</script>

<section class="page-hero compact-page-hero legal-hero">
  <h1>Terms of use.</h1>
  <p class="intro">These terms govern your use of the Sesame website and the hosted account service. By using them, you agree to what follows.</p>
  <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}</p>
</section>
<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#accept">Acceptance</a>
    <a href="#beta">Beta &amp; warranty</a>
    <a href="#accounts">Accounts &amp; use</a>
    <a href="#licence">Licence &amp; IP</a>
    <a href="#liability">Liability</a>
    <a href="#law">Termination &amp; law</a>
  </nav>
  <article class="document-copy">
    <div id="accept"><h2>Acceptance</h2><p>Creating a Sesame website account requires you to agree to these Terms of Use and acknowledge the <a href="/privacy">Privacy Policy</a>. The account service records this document version and the server time of that action. If you do not agree, do not create an account{facts.termsAcceptSuffix}.</p></div>
    <div id="beta"><h2>Beta and backups</h2><p>{facts.betaSentence} It has not completed an independent security review and may change, fail, or be withdrawn. Keep an independent encrypted backup and do not rely on Sesame as your only recovery path until its security review is finished.</p></div>
    <div id="accounts"><h2>Accounts and acceptable use</h2><p>A website account manages licence records, sessions, and connected desktop devices. It is not a vault account: do not enter a vault password, recovery kit, backup code, TOTP seed, or vault export on the website. Keep your account credentials secure and use Sesame only lawfully and for accounts you are authorised to use.</p></div>
    <div id="licence"><h2>Licence and intellectual property</h2><p>The Sesame software is free software under the GNU Affero General Public License v3.0 or later. Your rights to use, study, modify, and share it come from that licence, and nothing in these terms reduces them. These terms govern this website and the hosted account service, not your use of the source.</p><p>One thing sits outside the licence. The Sesame name, logo, and publisher identity are not granted by the AGPL: a modified build or a modified hosted service must use its own product name and identity, which is what keeps "Sesame" meaning this project. Truthful compatibility statements remain fine.</p></div>
    <div id="liability"><h2>Liability</h2><p>To the extent allowed by applicable law, Sesame is not responsible for indirect or consequential loss, or loss caused by using an unfinished beta without an independent backup. Nothing in these Terms excludes rights or liability that cannot lawfully be excluded, including mandatory consumer protections.</p></div>
    <div id="law"><h2>Ending access and applicable law</h2><p>Sesame may suspend a website account where these Terms are breached or a security risk requires it. The law and court information for any public launch will be supplied with the named operator details. Mandatory protections in your country of residence still apply. Contact <a href="/support">support</a> with questions.</p><p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p></div>
  </article>
</section>
