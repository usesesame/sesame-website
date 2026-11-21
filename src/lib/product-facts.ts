import type { ProductPlan, ProductStatus } from './product'

export const IMPORT_FORMAT_COUNT = 15

export const SYNC_PRICES = { monthly: 1, annual: 10, currency: 'EUR' } as const

export type FeatureIconName = 'vault' | 'import' | 'card' | 'shield' | 'key' | 'archive' | 'lock' | 'monitor' | 'versions' | 'file-key' | 'server' | 'cloud'
export type PlanFeature = { icon: FeatureIconName; label: string }

export const planFeatures: Record<string, PlanFeature[]> = {
  free: [
    { icon: 'vault', label: 'Encrypted local vault' },
    { icon: 'import', label: `Import from ${IMPORT_FORMAT_COUNT} formats` },
    { icon: 'card', label: 'Nine item types' },
    { icon: 'shield', label: '2FA codes and recovery details' },
    { icon: 'key', label: 'Windows Hello and PIN unlock' },
    { icon: 'archive', label: 'Backup, restore, and export' },
    { icon: 'server', label: 'Sync with your own server' },
  ],
  sync: [
    { icon: 'cloud', label: 'Sync server run by us' },
    { icon: 'lock', label: 'End-to-end encryption' },
    { icon: 'monitor', label: 'Device approval' },
    { icon: 'versions', label: 'Conflict review' },
    { icon: 'file-key', label: 'Local access if you cancel' },
  ],
}

const planDescriptions: Record<string, string> = {
  free: 'The whole app, open source under the AGPL. There is no paid version.',
  sync: 'Keeps your vault the same on every device you approve. We run the server, so you do not have to.',
}

export function withSiteWording(plan: ProductPlan): ProductPlan {
  const description = planDescriptions[plan.id]
  const features = planFeatures[plan.id]
  if (!description || !features) return plan
  return { ...plan, description, includes: features.map((feature) => feature.label) }
}

export const fallbackPlans: ProductPlan[] = [
  withSiteWording({ id: 'free', name: 'Sesame', price: '0', billing: 'none', available: true, description: '', includes: [] }),
  withSiteWording({
    id: 'sync',
    name: 'Sesame Sync',
    price: SYNC_PRICES.monthly.toFixed(2),
    annualPrice: SYNC_PRICES.annual.toFixed(2),
    billing: 'monthly',
    available: false,
    description: '',
    includes: [],
  }),
]

export type ProductFacts = {
  publicDownload: boolean
  syncAvailable: boolean
  syncAvailabilitySentence: string
  betaLabel: string
  betaSentence: string
  statusHeadline: string
  platformSummary: string
  accountPurposes: string[]
  supportDownloadAnswer: string
  privacyControllerSentence: string
  termsAcceptSuffix: string
}

export function syncPricePhrase(style: 'symbol' | 'code'): string {
  return style === 'symbol'
    ? `€${SYNC_PRICES.monthly} a month or €${SYNC_PRICES.annual} a year`
    : `EUR ${SYNC_PRICES.monthly} a month or EUR ${SYNC_PRICES.annual} a year`
}

export function productFacts(status: ProductStatus | null): ProductFacts {
  const platforms = status?.platforms?.length ? status.platforms : ['windows']
  const platformSummary = platforms
    .map((platform) => `${platform.charAt(0).toUpperCase()}${platform.slice(1)}`)
    .join(', ')
  const accountPurposes = status?.accountPurposes ?? []
  const syncAvailable = status?.cloudSyncAvailable === true
  const syncAvailabilitySentence = syncAvailable
    ? 'Hosted Sync is available for accounts that have it enabled.'
    : 'Hosted Sync is not available yet, but Sync itself is in the latest desktop release.'

  if (status?.publicDownload) {
    return {
      publicDownload: true,
      syncAvailable,
      syncAvailabilitySentence,
      betaLabel: 'Public beta',
      betaSentence: 'Sesame is a public beta.',
      statusHeadline: 'Public beta',
      platformSummary,
      accountPurposes,
      supportDownloadAnswer: 'Yes. Sesame is a free download for Windows and Linux.',
      privacyControllerSentence:
        'The public beta is open to download, and we will publish the operator identity and postal address before the beta ends.',
      termsAcceptSuffix: '',
    }
  }

  return {
    publicDownload: false,
    syncAvailable,
    syncAvailabilitySentence,
    betaLabel: 'Private beta',
    betaSentence: 'Sesame is a private beta.',
    statusHeadline: 'Private beta',
    platformSummary,
    accountPurposes,
    supportDownloadAnswer: 'Not yet. Sesame is an invite-only beta.',
    privacyControllerSentence:
      'The beta is invite-only, and every invitation includes the operator identity and postal address until the service opens to the public.',
    termsAcceptSuffix: ' or use an invite-only beta build',
  }
}

export type PricingFaqEntry = {
  question: string
  answer: string
  syncInterestLink?: boolean
}

export function pricingFaqEntries(syncAvailable: boolean): PricingFaqEntry[] {
  return [
    {
      question: 'What is free?',
      answer:
        'The whole app is free, including vault access, imports, 2FA, security checks, Windows Hello and PIN unlock, backup, restore, export, and recovery. It is open source under the AGPL.',
    },
    {
      question: 'Why does Sesame Sync cost money?',
      answer: `Sesame Sync is Sync on our servers, and servers cost money to run, so it is planned at ${syncPricePhrase('symbol')}. Our servers only receive encrypted data that they cannot read.`,
    },
    {
      question: 'Can I sync without paying?',
      answer: syncAvailable
        ? 'Yes. The Sync server is open source under the same licence as the app, so you can run it yourself for free. Sesame Sync is for people who would rather have us run it.'
        : 'Yes. Sync is in the latest desktop release and is off until you turn it on. The Sync server is open source under the same licence as the app, so you can run it yourself for free. Sesame Sync, which is Sync on our servers, is not open yet.',
      syncInterestLink: !syncAvailable,
    },
    {
      question: 'What happens if I stop paying, or Sesame shuts down?',
      answer:
        'Nothing changes for your vault. It is a file you already have, and it still opens with your master password, recovery kit, PIN, or Windows Hello.',
    },
  ]
}
