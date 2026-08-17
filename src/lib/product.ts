import { readPublic } from './api'

export type ProductStatus = {
  phase: string
  platforms: string[]
  accountRequired: boolean
  webSignInAvailable: boolean
  desktopConnectionAvailable: boolean
  cloudSyncAvailable: boolean
  publicDownload: boolean
  updated: string
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
  supported: ['Windows 11 version 24H2 or newer'],
  testedArchitectures: ['x64'],
  unsupported: ['Windows 10', 'Windows 11 versions older than 24H2', 'Windows on Arm'],
  note: 'Windows 10 is not supported in the Sesame beta. Compatibility will be reviewed again before a stable release.',
} as const

export function getProductStatus(): Promise<ProductStatus | null> {
  return readPublic<ProductStatus>('/v1/product/status')
}

export async function getPlans(): Promise<ProductPlan[] | null> {
  const result = await readPublic<{ plans: ProductPlan[] }>('/v1/plans')
  return result?.plans ?? null
}

export function getLatestWindowsRelease(): Promise<WindowsRelease | null> {
  return readPublic<WindowsRelease>('/v1/releases/latest?platform=windows')
}
