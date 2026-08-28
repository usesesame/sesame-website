<script lang="ts">
  import { LEGAL_UPDATED, LEGAL_VERSION } from '../lib/legal'
  import { productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'
  import { privacyEmail, siteHost } from '../lib/runtime-config'

  const facts = $derived(productFacts(productState.status))
</script>

<section class="page-hero compact-page-hero legal-hero">
  <h1>Privacy policy.</h1>
  <p class="intro">Sesame is designed so your vault never reaches our servers. This policy explains the limited data the website and account service process, and the rights you have under the GDPR, UK GDPR, and similar laws.</p>
  <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED} · Applies to {siteHost} and the Sesame website account</p>
</section>
<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#controller">Who we are</a>
    <a href="#data">Data we process</a>
    <a href="#basis">Purposes &amp; legal bases</a>
    <a href="#retention">Retention &amp; recipients</a>
    <a href="#transfers">International transfers</a>
    <a href="#rights">Your rights</a>
    <a href="#contact">Contact &amp; changes</a>
  </nav>
  <article class="document-copy">
    <div id="controller"><h2>Who is responsible</h2><p>Sesame operates the desktop application and the website at {siteHost}. For the optional website account, Sesame is the data controller. Privacy requests can be sent to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. {facts.privacyControllerSentence}</p></div>
    <div id="data"><h2>What we process</h2><p>The desktop app keeps vault entries, unlock material, imported exports, TOTP seeds, backup codes, and recovery notes on your device. The website and account API are not built to receive them. If you create a website account, the account service processes:</p><ul><li><strong>Account data:</strong> email address, verification state, a salted password hash, and the Terms and Privacy Policy versions recorded when the account was created.</li><li><strong>Access data:</strong> licence records and connected-desktop identifiers.</li><li><strong>Session and security data:</strong> session, CSRF, and temporary passkey-ceremony tokens; session timestamps; and short-lived rate-limit data derived from network information.</li><li><strong>Support data:</strong> text you deliberately submit through the attachment-free support form. The form rejects likely secrets before sending.</li></ul><p>We do not use advertising, behavioural analytics, profiling, session replay, or third-party trackers. We do not sell or rent personal data.</p></div>
    <div id="basis"><h2>Why we process it</h2><p>For EEA and UK users, the account service relies on <strong>contract</strong> to provide the account, licences, sessions, desktop connections, and recovery; and <strong>legitimate interests</strong> to prevent abuse, protect the service, and respond to a support request. Agreeing to the Terms is required to create the account; acknowledging this policy is not permission for marketing or tracking. The local desktop vault does not require a website account.</p></div>
    <div id="retention"><h2>Retention and recipients</h2><p>Account records remain until you ask for deletion or the beta is closed. Website sessions last up to 30 days unless revoked or signed out sooner. The CSRF token lasts up to one hour and a passkey ceremony token lasts up to ten minutes. Support reports have no automatic expiry in this beta; do not put sensitive information in them and request deletion by email when it is no longer needed. Sesame operates no analytics, advertising, or profiling processors.</p><p>The service runs on two processors, and no others:</p><ul><li><strong>Hetzner Online GmbH</strong>, Falkenstein, Germany. Hosts the server, the account database, and the mail relay that sends account email. All account data is stored here, inside the EU.</li><li><strong>Cloudflare, Inc.</strong>, United States. Provides authoritative DNS for the domain, and forwards mail addressed to published contact addresses such as the privacy address to an operator mailbox.</li></ul><p>Account email is sent from Sesame's own mail relay on the Hetzner server rather than a third-party sending provider, so the contents of verification, recovery, and email-change messages are not processed by an external mail service.</p></div>
    <div id="transfers"><h2>International transfers</h2><p>Account records, the database, and outbound account email stay on infrastructure located in Germany, inside the EEA. No transfer safeguard is required for that processing.</p><p>Cloudflare, Inc. is established in the United States. Its role is limited to authoritative DNS and to forwarding mail sent to Sesame's published contact addresses, which means the contents of a message you send to those addresses pass through a processor outside the EEA. That transfer relies on the data processing terms Cloudflare offers its customers, including the European Commission's standard contractual clauses. If you would rather not use a US processor for that route, contact details published on this site can also be reached through the account portal's support form, which does not involve Cloudflare mail routing.</p></div>
    <div id="rights"><h2>Your rights</h2><p>Subject to applicable law, you may request <strong>access</strong>, <strong>rectification</strong>, <strong>erasure</strong>, <strong>restriction</strong>, and <strong>portability</strong> of your data, and <strong>object</strong> to processing based on legitimate interests. Email <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> to exercise these rights. You may also complain to your local data-protection authority. Sesame aims to respond within one month where the GDPR applies.</p></div>
    <div id="contact"><h2>Contact and changes</h2><p>Privacy questions and requests: <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> or the <a href="/support">support page</a>. We will publish a new version and highlight material changes before applying them to existing website accounts.</p><p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p></div>
  </article>
</section>
