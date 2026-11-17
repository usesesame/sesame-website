import { readPublic } from './api'
import { parseExtensions, type PublicExtension } from './extension-parse'
import { parsePlans, parseProductRelease, parseProductStatus } from './product-parse'

export type ProductStatus = {
  phase: string
  platforms: string[]
  accountRequired: boolean
  webSignInAvailable: boolean
  desktopConnectionAvailable: boolean
  cloudSyncAvailable: boolean
  publicDownload: boolean
  updated: string
  // An API older than these fields still renders every page.
  registrationMode?: 'closed' | 'invite' | 'public'
  accountPurposes?: string[]
}

export type ProductPlan = {
  id: string
  name: string
  price: string
  annualPrice?: string
  billing: 'none' | 'one_time' | 'monthly' | 'yearly'
  available: boolean
  description: string
  includes: string[]
}

export type ProductRelease = {
  channel: string
  platform: string
  available: boolean
  version?: string
  url?: string
  sha256?: string
  signed: boolean
  message: string
  publishedAt?: string
  supportedWindows?: string[]
  releaseNotes?: string[]
  releaseNotesUrl?: string
  signingKeyId?: string
  rollbackNotice?: string
  artifacts?: Array<{ name: string; format: 'msi' | 'nsis' | 'appimage' | 'deb' | 'rpm'; url: string; sha256: string; signed: boolean }>
}

export function getProductStatus(): Promise<ProductStatus | null> {
  return readPublic('/v1/product/status').then(parseProductStatus)
}

export async function getPlans(): Promise<ProductPlan[] | null> {
  const raw = await readPublic('/v1/plans')
  return raw === null ? null : parsePlans(raw)
}

export function getExtensions(): Promise<PublicExtension[] | null> {
  return readPublic('/v1/extensions').then(parseExtensions)
}

export function getLatestWindowsRelease(): Promise<ProductRelease | null> {
  return readPublic('/v1/releases/latest?platform=windows').then(parseProductRelease)
}

export function getLatestLinuxRelease(): Promise<ProductRelease | null> {
  return readPublic('/v1/releases/latest?platform=linux').then(parseProductRelease)
}
