import type { ProductPlan, ProductStatus } from './product'

export const IMPORT_FORMAT_COUNT = 15

export const SYNC_PRICES = { monthly: 1, annual: 10, currency: 'EUR' } as const

export const REGISTRATION_MODE_LABELS: Record<'closed' | 'invite' | 'public', string> = {
  closed: 'Closed',
  invite: 'Invite only',
  public: 'Open',
}

export const fallbackPlans: ProductPlan[] = [
  {
    id: 'free',
    name: 'Sesame',
    price: '0',
    billing: 'none',
    available: true,
    description: 'The whole app, free and open source under the AGPL.',
    includes: [
      'Encrypted vault',
      `${IMPORT_FORMAT_COUNT} import formats`,
      'Nine record types',
      '2FA and recovery details',
      'Windows Hello and PIN unlock',
      'Backup, restore, and export',
    ],
  },
  {
    id: 'sync',
    name: 'Sesame Sync',
    price: SYNC_PRICES.monthly.toFixed(2),
    annualPrice: SYNC_PRICES.annual.toFixed(2),
    billing: 'monthly',
    available: false,
    description: 'Optional hosted sync between your own approved devices. Not available until its security review passes.',
    includes: [
      'Approved devices',
      'End-to-end encryption',
      'Conflict review',
      'Local access if Sync ends',
      'Self-host it instead if you prefer',
    ],
  },
]

export type ProductFacts = {
  publicDownload: boolean
  betaLabel: string
  betaSentence: string
  statusHeadline: string
  heroAvailability: string
  platformSummary: string
  downloadState: string
  webSignIn: string
  sync: string
  registration: string | null
  accountPurposes: string[]
  supportDownloadAnswer: string
  pricingBuyAnswer: string
  privacyControllerSentence: string
  termsAcceptSuffix: string
}

export function syncPricePhrase(style: 'symbol' | 'code'): string {
  return style === 'symbol'
    ? `€${SYNC_PRICES.monthly} monthly or €${SYNC_PRICES.annual} yearly`
    : `EUR ${SYNC_PRICES.monthly} monthly or EUR ${SYNC_PRICES.annual} yearly`
}

export function productFacts(status: ProductStatus | null): ProductFacts {
  const platforms = status?.platforms?.length ? status.platforms : ['windows']
  const platformSummary = platforms
    .map((platform) => `${platform.charAt(0).toUpperCase()}${platform.slice(1)}`)
    .join(', ')
  const webSignIn = status?.webSignInAvailable ? 'Optional' : 'Not required'
  const sync = status?.cloudSyncAvailable ? 'Available' : 'Not available'
  const registration = status?.registrationMode ? REGISTRATION_MODE_LABELS[status.registrationMode] : null
  const accountPurposes = status?.accountPurposes ?? []

  if (status?.publicDownload) {
    return {
      publicDownload: true,
      betaLabel: 'Public beta',
      betaSentence: 'Sesame is a public beta.',
      statusHeadline: 'Public beta.',
      heroAvailability: 'Public download available',
      platformSummary,
      downloadState: 'Available',
      webSignIn,
      sync,
      registration,
      accountPurposes,
      supportDownloadAnswer: 'Yes. The current Windows build is a public download.',
      pricingBuyAnswer: 'No. Nothing is for sale yet.',
      privacyControllerSentence:
        'The public beta is open to download; its operator identity and postal contact will be published before the beta ends.',
      termsAcceptSuffix: '',
    }
  }

  return {
    publicDownload: false,
    betaLabel: 'Private beta',
    betaSentence: 'Sesame is a private beta.',
    statusHeadline: 'Private beta.',
    heroAvailability: 'Private beta · Windows 10 and 11',
    platformSummary,
    downloadState: 'Not available',
    webSignIn,
    sync,
    registration,
    accountPurposes,
    supportDownloadAnswer: 'Not yet. Sesame is an invite-only Windows beta.',
    pricingBuyAnswer: 'No. Sesame is an invite-only Windows beta and nothing is for sale.',
    privacyControllerSentence:
      'The public beta remains invite-only; its operator identity and postal contact must be supplied in every invitation before the service is opened to the public.',
    termsAcceptSuffix: ' or use an invite-only beta build',
  }
}

export type PricingFaqEntry = {
  question: string
  answer: string
  syncInterestLink?: boolean
}

export function pricingFaqEntries(facts: ProductFacts): PricingFaqEntry[] {
  return [
    {
      question: 'What is free?',
      answer:
        'The application, all of it. Vault access, imports, 2FA, security checks, Windows Hello and PIN unlock, backup, restore, export, and recovery. Sesame is AGPL software, so there is no paid edition and no feature held back for one.',
    },
    {
      question: 'Then what is the subscription for?',
      answer: `Running hosted sync costs money to operate, so Sesame Sync is planned at ${syncPricePhrase('symbol')}. It syncs ciphertext between your own approved devices. It is not available yet.`,
    },
    {
      question: 'Can I sync without paying?',
      answer:
        'The sync service is in the server repository under the same licence, so you can run it yourself. It is not enabled for anyone today, hosted or self-hosted, and it stays that way until its security review passes.',
    },
    {
      question: 'What happens if I stop paying, or Sesame stops?',
      answer:
        'Your vault is a local file you already have. It opens with your master password, recovery kit, PIN, or Windows Hello, with no account and no server. Losing Sync does not lock a vault.',
    },
    {
      question: 'Can I buy now?',
      answer: facts.pricingBuyAnswer,
      syncInterestLink: true,
    },
  ]
}
