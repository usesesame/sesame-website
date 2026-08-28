import { readPublic } from './api'
import { parsePlans, parseProductStatus, parseWindowsRelease } from './product-parse'

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

export type WindowsRelease = {
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
  artifacts?: Array<{ name: string; format: 'msi' | 'nsis'; url: string; sha256: string; signed: boolean }>
}

export const WINDOWS_BETA_SUPPORT = {
  supported: ['Windows 10', 'Windows 11'],
  testedArchitectures: ['x64'],
  unsupported: ['Windows on Arm'],
  note: 'Sesame runs on 64-bit Windows 10 and Windows 11. Beta testing has concentrated on current Windows 11 builds, so report anything that behaves differently on Windows 10.',
} as const

export function getProductStatus(): Promise<ProductStatus | null> {
  return readPublic('/v1/product/status').then(parseProductStatus)
}

export async function getPlans(): Promise<ProductPlan[] | null> {
  const raw = await readPublic('/v1/plans')
  return raw === null ? null : parsePlans(raw)
}

export function getLatestWindowsRelease(): Promise<WindowsRelease | null> {
  return readPublic('/v1/releases/latest?platform=windows').then(parseWindowsRelease)
}
