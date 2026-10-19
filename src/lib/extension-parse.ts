export type PublicExtension = {
  store: 'chrome' | 'edge' | 'firefox'
  version: string
  status: 'approved' | 'published'
  listingUrl?: string
}

const stores = ['chrome', 'edge', 'firefox'] as const
const chromeListing = /^https:\/\/chromewebstore\.google\.com\/detail\/[a-p]{32}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

// The listing address is only trusted in the one shape the server builds, so a
// changed or hostile answer cannot put another link on the page.
function parseExtension(value: unknown): PublicExtension | null {
  if (!isRecord(value)) return null
  const { store, version, status, listingUrl } = value
  if (typeof store !== 'string' || !(stores as readonly string[]).includes(store)) return null
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) return null
  if (status !== 'approved' && status !== 'published') return null
  if (status === 'approved') return listingUrl === undefined ? { store: store as PublicExtension['store'], version, status } : null
  if (store !== 'chrome' || typeof listingUrl !== 'string' || !chromeListing.test(listingUrl)) return null
  return { store, version, status, listingUrl }
}

export function parseExtensions(value: unknown): PublicExtension[] | null {
  if (!isRecord(value) || !Array.isArray(value.extensions)) return null
  const parsed = value.extensions.map(parseExtension)
  return parsed.every((entry): entry is PublicExtension => entry !== null) ? parsed : null
}

export type ChromeExtensionState = { status: 'none' | 'approved' | 'published'; listingUrl?: string }

export function chromeExtensionState(extensions: PublicExtension[]): ChromeExtensionState {
  const chrome = extensions.find((entry) => entry.store === 'chrome')
  if (!chrome) return { status: 'none' }
  return chrome.status === 'published' ? { status: 'published', listingUrl: chrome.listingUrl } : { status: 'approved' }
}
