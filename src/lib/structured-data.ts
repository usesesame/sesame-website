import { IMPORT_FORMAT_COUNT, pricingFaqEntries, type ProductFacts } from './product-facts'

export function ldJson(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

export function homeGraph(origin: string, email: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'Sesame',
        url: `${origin}/`,
        email,
        sameAs: ['https://github.com/usesesame'],
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: 'Sesame',
        url: `${origin}/`,
        inLanguage: 'en-GB',
        publisher: { '@id': `${origin}/#organization` },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${origin}/#desktop-app`,
        name: 'Sesame',
        applicationCategory: 'SecurityApplication',
        applicationSubCategory: 'Password Manager',
        operatingSystem: 'Windows 10, Windows 11, Linux',
        url: `${origin}/`,
        softwareVersion: '0.2.0',
        downloadUrl: 'https://github.com/usesesame/sesame-desktop/releases/latest',
        releaseNotes: 'https://github.com/usesesame/sesame-desktop/releases',
        description:
          'An open source password, 2FA, and recovery vault for Windows and Linux. The vault is encrypted on your device and never sent to a server.',
        featureList: [
          'Encrypted local vault',
          `${IMPORT_FORMAT_COUNT} import formats`,
          'Nine record types',
          'TOTP two-factor codes',
          'Windows Hello and PIN unlock',
          'Linux packages: deb, rpm, and AppImage',
          'Recovery details',
          'Backup, restore, and export',
        ],
        publisher: { '@id': `${origin}/#organization` },
        license: 'https://www.gnu.org/licenses/agpl-3.0.html',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
      },
    ],
  }
}

export function pricingFaqPage(facts: ProductFacts) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaqEntries(facts).map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: { '@type': 'Answer', text: entry.answer },
    })),
  }
}
