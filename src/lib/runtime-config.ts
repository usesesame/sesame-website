function developmentOrigin(): string | undefined {
  if (!import.meta.env.DEV || typeof window === 'undefined') return undefined
  return window.location.origin
}

function validOrigin(name: string, configured: string): string {
  let url: URL
  try {
    url = new URL(configured)
  } catch {
    throw new Error(`${name} must be an absolute origin.`)
  }
  const loopbackHTTP = url.protocol === 'http:'
    && (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]')
  if ((url.protocol !== 'https:' && !loopbackHTTP)
    || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`${name} must be an HTTPS origin (HTTP is allowed only for loopback development).`)
  }
  return url.origin
}

function configuredOrigin(name: string, value: string | undefined): string {
  const configured = value?.trim()
  if (!configured) {
    const localOrigin = developmentOrigin()
    if (localOrigin) return localOrigin
    throw new Error(`${name} must be configured at build time.`)
  }
  return validOrigin(name, configured)
}

// Empty is a deliberate deployment choice; a malformed value still fails the build.
function optionalOrigin(name: string, value: string | undefined): string {
  const configured = value?.trim()
  if (!configured) return ''
  return validOrigin(name, configured)
}

function configuredEmail(name: string, value: string | undefined): string {
  const email = value?.trim()
  if (!email && import.meta.env.DEV) {
    const hostname = new URL(siteOrigin).hostname
    return `privacy@${hostname}`
  }
  if (!email || /[\r\n]/.test(email) || !/^[^\s@]+@[^\s@]+$/.test(email)) {
    throw new Error(`${name} must be a valid contact email address.`)
  }
  return email
}

// Required: a wrong canonical URL is an SEO defect that ships silently. No production origin is compiled in.
export const siteOrigin = configuredOrigin('VITE_SESAME_SITE_ORIGIN', import.meta.env.VITE_SESAME_SITE_ORIGIN)

export const siteHost = new URL(siteOrigin).host

export const apiBaseURL = optionalOrigin('VITE_SESAME_API_URL', import.meta.env.VITE_SESAME_API_URL)

export const accountOrigin = optionalOrigin('VITE_SESAME_ACCOUNT_URL', import.meta.env.VITE_SESAME_ACCOUNT_URL)

export const privacyEmail = configuredEmail('VITE_SESAME_PRIVACY_EMAIL', import.meta.env.VITE_SESAME_PRIVACY_EMAIL)

// Null when no portal is configured; an unguarded relative path would 404 on a static site.
export function accountUrl(path: string): string | null {
  return accountOrigin ? `${accountOrigin}${path}` : null
}
