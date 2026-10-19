<script lang="ts">
  import { LEGAL_UPDATED, LEGAL_VERSION } from '../lib/legal'
  import { productFacts } from '../lib/product-facts'
  import { productState } from '../lib/product-state.svelte'
  import { privacyEmail, siteHost } from '../lib/runtime-config'

  const facts = $derived(productFacts(productState.status))
</script>

<section class="page-hero compact-page-hero legal-hero">
  <h1>Privacy policy</h1>
  <p class="intro">Sesame keeps your vault on your computer and never receives it. This policy explains the limited data the website and account service handle, what the browser extension does, and your rights under the GDPR, UK GDPR, and similar laws.</p>
  <p class="page-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED} · Applies to {siteHost}, the Sesame website account, and the Sesame browser extension</p>
</section>
<section class="section document-section">
  <nav class="document-nav" aria-label="On this page">
    <strong>On this page</strong>
    <a href="#controller">Who we are</a>
    <a href="#data">Data we process</a>
    <a href="#extension">Browser extension</a>
    <a href="#basis">Purposes and legal bases</a>
    <a href="#retention">Retention and recipients</a>
    <a href="#transfers">International transfers</a>
    <a href="#rights">Your rights</a>
    <a href="#contact">Contact and changes</a>
  </nav>
  <article class="document-copy">
    <div id="controller">
      <h2>Who is responsible</h2>
      <p>Sesame runs the desktop app and the website at {siteHost}. For the optional website account, Sesame is the data controller. Send privacy requests to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>. {facts.privacyControllerSentence}</p>
    </div>

    <div id="data">
      <h2>What we process</h2>
      <p>The desktop app keeps your vault entries, unlock material, imported exports, 2FA seeds, backup codes, and recovery notes on your device. The website and the account service are not built to receive them. If you turn on Sync, the desktop app sends an encrypted copy of your vault to a server you run, and Sesame never receives it.</p>
      <p>If you create a website account, the account service handles this data:</p>
      <ul>
        <li>Your email address, whether it is verified, a salted password hash, and the Terms and Privacy Policy versions you accepted.</li>
        <li>Your licence records and the identifiers of your connected desktops.</li>
        <li>Session, CSRF, and passkey tokens, session times, and short-lived rate-limit data derived from network information.</li>
        <li>A record of account security events, such as sign-ins and changes.</li>
        <li>The text you send through the support form, which takes no attachments and rejects likely secrets before sending.</li>
      </ul>
      <p>Sesame has no advertising, behavioural analytics, profiling, session replay, or third-party trackers, and it does not sell or rent personal data.</p>
    </div>

    <div id="extension">
      <h2>The browser extension</h2>
      <p>The browser extension has no server and no account. It asks the desktop app for the value you want, and the desktop app answers only after you approve. To do this, the extension reads the structure of the form on the active tab and writes the approved value into it.</p>
      <p>If you choose Save this login after Sesame filled a sign-up form, the extension reads the new username and password from that form and sends them to the desktop app for your approval. A password the extension generates in the change password flow stays in memory until you save it, close the tab, leave the site, or ten minutes pass. Other credential values stay in memory only while a request or an approval is open.</p>
      <p>The extension writes none of these values to browser storage, logs, or any server. Its browser storage holds only the sites where you paused the inline button and whether onboarding was shown. It sends nothing to Sesame or to anyone else.</p>
    </div>

    <div id="basis">
      <h2>Why we process it</h2>
      <p>For users in the EEA and the UK, the account service relies on contract to provide the account, licences, sessions, desktop connections, and recovery. It relies on legitimate interests to prevent abuse, protect the service, and answer support requests.</p>
      <p>You must agree to the Terms to create an account. Acknowledging this policy does not give permission for marketing or tracking. The desktop vault does not need a website account.</p>
    </div>

    <div id="retention">
      <h2>Retention and recipients</h2>
      <p>Account records stay until you ask for deletion or the beta closes. Website sessions last up to 30 days unless you sign out or revoke them sooner. Account security events are kept for 180 days. The CSRF token lasts up to one hour, and a passkey token lasts up to ten minutes. Support requests have no automatic expiry in this beta, so keep sensitive information out of them and ask for deletion by email when you no longer need them.</p>
      <p>Two processors run the service, and there are no others:</p>
      <ul>
        <li>Hetzner Online GmbH in Falkenstein, Germany, hosts the server, the account database, and the mail relay that sends account email. All account data is stored there, inside the EU.</li>
        <li>Cloudflare, Inc. in the United States provides DNS for the domain and forwards mail sent to published contact addresses, such as the privacy address, to an operator mailbox.</li>
      </ul>
      <p>Account email goes out through Sesame's own mail relay on the Hetzner server, so no outside mail service sees verification, recovery, or email change messages.</p>
    </div>

    <div id="transfers">
      <h2>International transfers</h2>
      <p>Account records, the database, and outgoing account email stay in Germany, inside the EEA, so they need no transfer safeguard.</p>
      <p>Cloudflare is established in the United States. A message you send to a published contact address passes through Cloudflare, which is a processor outside the EEA. That transfer relies on Cloudflare's data processing terms, including the European Commission's standard contractual clauses. If you prefer not to use that route, contact us through the support form, which does not use Cloudflare mail routing.</p>
    </div>

    <div id="rights">
      <h2>Your rights</h2>
      <p>Under applicable law you can ask for access to your data, correction, deletion, restriction, and a portable copy, and you can object to processing based on legitimate interests. Email <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> to use these rights. You can also complain to your local data protection authority. Where the GDPR applies, we aim to reply within one month.</p>
    </div>

    <div id="contact">
      <h2>Contact and changes</h2>
      <p>Send privacy questions and requests to <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a> or use the <a href="/support">support page</a>. Before a material change applies to existing accounts, we will publish the new version and highlight what changed.</p>
      <p class="doc-meta">Version {LEGAL_VERSION} · Updated {LEGAL_UPDATED}.</p>
    </div>
  </article>
</section>
