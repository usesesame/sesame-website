import { apiBaseURL } from './runtime-config'

const REQUEST_TIMEOUT_MS = 8_000

// Public client: sends no cookies, CSRF token, or unsafe method, so it cannot act on an account session. Resolves to null with no API configured.
export async function readPublic<T>(path: string): Promise<T | null> {
  if (!apiBaseURL) return null
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${apiBaseURL}${path}`, {
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      signal: controller.signal,
    })
    if (!response.ok) return null
    return await response.json() as T
  } catch {
    return null
  } finally {
    window.clearTimeout(timeout)
  }
}
