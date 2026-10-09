import { getLatestLinuxRelease, getLatestWindowsRelease, getPlans, getProductStatus } from './product'
import { fallbackPlans } from './product-facts'
import { parseProductRelease, parseProductStatus } from './product-parse'
import { refreshChannel } from './release-summary'
import rawRelease from './latest-release.json'
import rawLinuxRelease from './latest-release-linux.json'
import rawStatus from './product-status.json'

export const productState = $state({
  status: parseProductStatus(rawStatus),
  release: parseProductRelease(rawRelease),
  linuxRelease: parseProductRelease(rawLinuxRelease),
  plans: fallbackPlans,
  releaseLive: { windows: false, linux: false },
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
  const [windows, linux] = await Promise.all([
    refreshChannel({ release: productState.release, live: productState.releaseLive.windows }, getLatestWindowsRelease),
    refreshChannel({ release: productState.linuxRelease, live: productState.releaseLive.linux }, getLatestLinuxRelease),
  ])
  productState.release = windows.release
  productState.releaseLive.windows = windows.live
  productState.linuxRelease = linux.release
  productState.releaseLive.linux = linux.live
}
