<script lang="ts">
  import { accountUrl } from './lib/runtime-config'

  const requestUrl = accountUrl('/support')
</script>

<section class="page-hero compact-page-hero">
  <h1>How can we help?</h1>
  <p class="intro">Ask a question, report a bug, or tell us what is broken in the beta. Never include passwords or vault files.</p>
</section>

<section class="section support-section safe-support">
  <aside class="support-guide card">
    <div><h2>Helpful</h2><ul><li>App and Windows version</li><li>What you clicked</li><li>The exact error</li></ul></div>
    <div><h2>Never send</h2><ul><li>Passwords or codes</li><li>Vault or export files</li><li>Recovery kits or keys</li></ul></div>
  </aside>

  <div class="support-intake card" id="new-request">
    <div class="support-form-head"><h2>Send a request</h2><span>No attachments</span></div>
    {#if requestUrl}
      <p>Requests are written in the account portal. It checks for common secret patterns before anything is sent, and it works without an account: a guest request enters the same queue.</p>
      <p><a class="button" href={requestUrl}>Open the support form</a></p>
      <p class="support-safety">Signing in first keeps a request history you can follow. A reference number alone never grants access to a request's contents.</p>
    {:else}
      <p>This deployment runs no account service, so there is no request form here. Report a security problem through the security policy in the project repository, and use the repository's issues for everything else.</p>
      <p class="support-safety">Never include a password, vault file, recovery kit, or 2FA code in a report, wherever you send it.</p>
    {/if}
  </div>
</section>

<section class="section support-faq">
  <div class="faq-block">
    <h2>Common questions</h2>
    <details><summary>Can I download Sesame now?</summary><p>Not yet. Sesame is an invite-only Windows beta.</p></details>
    <details><summary>Can support unlock my vault?</summary><p>No. Use your recovery kit or PIN. Without an unlock method, the vault cannot be recovered.</p></details>
    <details><summary>What can I import?</summary><p>15 formats from Bitwarden, 1Password, major browsers, and other password managers.</p></details>
    <details><summary>Does Sync work yet?</summary><p>No. It stays disabled until independent review and operating gates pass.</p></details>
    <details><summary>Is there a mobile app or browser extension?</summary><p>No mobile app yet. The browser helper is not in stores.</p></details>
    <details><summary>Where is my vault stored?</summary><p>On your Windows PC. The website and API never receive it.</p></details>
    <details><summary>Has Sesame been independently reviewed?</summary><p>Not yet. Use test data and keep an encrypted backup.</p></details>
  </div>
</section>
