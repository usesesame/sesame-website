export type RouteKey =
  | 'home'
  | 'security'
  | 'pricing'
  | 'roadmap'
  | 'releases'
  | 'support'
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'not-found'

export type Route = {
  path: string
  key: RouteKey
  title: string
  description: string
  index: boolean
}

export const routes: Route[] = [
  {
    path: '/',
    key: 'home',
    title: 'Sesame: Open Source Passwords, 2FA and Recovery',
    description: 'An open source password vault for Windows and Linux. Import passwords, 2FA codes, and recovery details. Sesame never receives your vault. Free download.',
    index: true,
  },
  {
    path: '/security',
    key: 'security',
    title: 'Security Model | Sesame Password Manager',
    description: 'What stays on your computer, what the website stores, and how to check both against the published source.',
    index: true,
  },
  {
    path: '/pricing',
    key: 'pricing',
    title: 'Pricing | Sesame',
    description: 'The app is free and open source. Sesame Sync is planned at EUR 1 monthly or EUR 10 yearly, and you can run it yourself instead.',
    index: true,
  },
  {
    path: '/roadmap',
    key: 'roadmap',
    title: 'Product Roadmap | Sesame',
    description: 'The release plan for the Sesame desktop vault, encrypted Sync, and the Chrome and Edge extension.',
    index: true,
  },
  {
    path: '/releases',
    key: 'releases',
    title: 'Releases | Sesame',
    description: 'Official Sesame release status for Windows and Linux, public beta installers, SHA-256 checksums, and how to verify a download.',
    index: true,
  },
  {
    path: '/support',
    key: 'support',
    title: 'Support | Sesame',
    description: 'Get help with Sesame without sending passwords, vault files, 2FA secrets, or recovery codes.',
    index: true,
  },
  {
    path: '/privacy',
    key: 'privacy',
    title: 'Privacy Policy | Sesame',
    description: 'How the Sesame website account processes limited account and technical data while the desktop vault stays local.',
    index: true,
  },
  {
    path: '/terms',
    key: 'terms',
    title: 'Terms of Use | Sesame',
    description: 'Terms for the Sesame website and hosted account service. The software itself is licensed under the AGPL.',
    index: true,
  },
  {
    path: '/cookies',
    key: 'cookies',
    title: 'Cookie Policy | Sesame',
    description: 'The first-party session and preference storage used by the Sesame website.',
    index: true,
  },
]

export const notFoundRoute: Route = {
  path: '/404',
  key: 'not-found',
  title: 'Page not found | Sesame',
  description: 'The requested Sesame page could not be found.',
  index: false,
}

export function routeForPath(path: string): Route {
  return routes.find((route) => route.path === path) ?? notFoundRoute
}
