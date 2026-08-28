import type { ProductPlan, ProductStatus, WindowsRelease } from './product'

const registrationModes = ['closed', 'invite', 'public'] as const
const billingModes = ['none', 'one_time', 'monthly', 'yearly'] as const
const artifactFormats = ['msi', 'nsis'] as const

type RegistrationMode = (typeof registrationModes)[number]
type ReleaseArtifact = NonNullable<WindowsRelease['artifacts']>[number]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isNumericString(value: unknown): value is string {
  return isString(value) && /^\d+(\.\d{1,2})?$/.test(value)
}

function isDateString(value: unknown): value is string {
  return isString(value) && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

const trustedReleaseHosts = ['github.com']
const trustedReleasePathPrefix = '/usesesame/'

function isReleaseUrl(value: unknown): value is string {
  if (!isString(value)) return false
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password) return false
    if (!trustedReleaseHosts.includes(url.hostname)) return false
    return url.pathname === trustedReleasePathPrefix.slice(0, -1)
      || url.pathname.startsWith(trustedReleasePathPrefix)
  } catch {
    return false
  }
}

function isSha256(value: unknown): value is string {
  return isString(value) && /^[0-9a-f]{64}$/i.test(value)
}

function isRegistrationMode(value: unknown): value is RegistrationMode {
  return isString(value) && (registrationModes as readonly string[]).includes(value)
}

function oneOf<T extends string>(value: unknown, modes: readonly T[]): T | null {
  return isString(value) && (modes as readonly string[]).includes(value) ? (value as T) : null
}

function optionalField<T>(value: Record<string, unknown>, key: string, guard: (field: unknown) => field is T): T | undefined | null {
  if (value[key] === undefined) return undefined
  return guard(value[key]) ? (value[key] as T) : null
}

export function parseProductStatus(value: unknown): ProductStatus | null {
  if (!isRecord(value)) return null
  if (!isString(value.phase) || !isDateString(value.updated)) return null
  if (!isStringArray(value.platforms) || value.platforms.length === 0) return null
  if (!isBoolean(value.accountRequired) || !isBoolean(value.webSignInAvailable)) return null
  if (!isBoolean(value.desktopConnectionAvailable) || !isBoolean(value.cloudSyncAvailable)) return null
  if (!isBoolean(value.publicDownload)) return null
  const registrationMode = optionalField(value, 'registrationMode', isRegistrationMode)
  if (registrationMode === null) return null
  const accountPurposes = optionalField(value, 'accountPurposes', isStringArray)
  if (accountPurposes === null) return null
  return {
    phase: value.phase,
    platforms: value.platforms,
    accountRequired: value.accountRequired,
    webSignInAvailable: value.webSignInAvailable,
    desktopConnectionAvailable: value.desktopConnectionAvailable,
    cloudSyncAvailable: value.cloudSyncAvailable,
    publicDownload: value.publicDownload,
    updated: value.updated,
    registrationMode,
    accountPurposes,
  }
}

function parsePlan(value: unknown): ProductPlan | null {
  if (!isRecord(value)) return null
  if (!isString(value.id) || !isString(value.name) || !isString(value.description)) return null
  if (!isNumericString(value.price) || !isBoolean(value.available)) return null
  if (!isStringArray(value.includes)) return null
  const billing = oneOf(value.billing, billingModes)
  if (billing === null) return null
  const annualPrice = optionalField(value, 'annualPrice', isNumericString)
  if (annualPrice === null) return null
  return {
    id: value.id,
    name: value.name,
    price: value.price,
    annualPrice,
    billing,
    available: value.available,
    description: value.description,
    includes: value.includes,
  }
}

export function parsePlans(value: unknown): ProductPlan[] | null {
  if (!isRecord(value) || !Array.isArray(value.plans)) return null
  const plans: ProductPlan[] = []
  for (const entry of value.plans) {
    const plan = parsePlan(entry)
    if (!plan) return null
    plans.push(plan)
  }
  return plans
}

function parseArtifact(value: unknown): ReleaseArtifact | null {
  if (!isRecord(value)) return null
  if (!isString(value.name) || !isString(value.sha256) || !isBoolean(value.signed)) return null
  if (!isReleaseUrl(value.url)) return null
  const format = oneOf(value.format, artifactFormats)
  if (format === null) return null
  return { name: value.name, format, url: value.url, sha256: value.sha256, signed: value.signed }
}

function parseArtifacts(value: unknown): ReleaseArtifact[] | undefined | null {
  if (value === undefined) return undefined
  if (!Array.isArray(value)) return null
  const artifacts: ReleaseArtifact[] = []
  for (const entry of value) {
    const artifact = parseArtifact(entry)
    if (!artifact) return null
    artifacts.push(artifact)
  }
  return artifacts
}

export function parseWindowsRelease(value: unknown): WindowsRelease | null {
  if (!isRecord(value)) return null
  if (!isString(value.channel) || !isString(value.platform) || !isString(value.message)) return null
  if (!isBoolean(value.available) || !isBoolean(value.signed)) return null
  const version = optionalField(value, 'version', isString)
  if (version === null) return null
  const url = optionalField(value, 'url', isReleaseUrl)
  if (url === null) return null
  const sha256 = optionalField(value, 'sha256', isSha256)
  if (sha256 === null) return null
  const publishedAt = optionalField(value, 'publishedAt', isString)
  if (publishedAt === null) return null
  const releaseNotesUrl = optionalField(value, 'releaseNotesUrl', isReleaseUrl)
  if (releaseNotesUrl === null) return null
  const signingKeyId = optionalField(value, 'signingKeyId', isString)
  if (signingKeyId === null) return null
  const rollbackNotice = optionalField(value, 'rollbackNotice', isString)
  if (rollbackNotice === null) return null
  const supportedWindows = optionalField(value, 'supportedWindows', isStringArray)
  if (supportedWindows === null) return null
  const releaseNotes = optionalField(value, 'releaseNotes', isStringArray)
  if (releaseNotes === null) return null
  const artifacts = parseArtifacts(value.artifacts)
  if (artifacts === null) return null
  return {
    channel: value.channel,
    platform: value.platform,
    available: value.available,
    version,
    url,
    sha256,
    signed: value.signed,
    message: value.message,
    publishedAt,
    supportedWindows,
    releaseNotes,
    releaseNotesUrl,
    signingKeyId,
    rollbackNotice,
    artifacts,
  }
}
