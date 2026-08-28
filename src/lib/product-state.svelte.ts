import { getLatestWindowsRelease, getPlans, getProductStatus } from './product'
import { fallbackPlans } from './product-facts'
import { parseProductStatus, parseWindowsRelease } from './product-parse'
import rawRelease from './latest-release.json'
import rawStatus from './product-status.json'

export const productState = $state({
  status: parseProductStatus(rawStatus),
  release: parseWindowsRelease(rawRelease),
  plans: fallbackPlans,
})

export async function loadStatus(): Promise<void> {
  const value = await getProductStatus()
  if (value) productState.status = value
}

export async function loadPlans(): Promise<void> {
  const value = await getPlans()
  if (value && value.length > 0) productState.plans = value
}

export async function loadLatestRelease(): Promise<void> {
  const value = await getLatestWindowsRelease()
  if (value) productState.release = value
}
