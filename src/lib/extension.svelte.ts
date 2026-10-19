import { chromeExtensionState, type ChromeExtensionState } from './extension-parse'
import { productState } from './product-state.svelte'

export const chromeExtensionNeeds = 'It needs Sesame 0.4.1 or newer.'

export function extensionState(): ChromeExtensionState {
  return chromeExtensionState(productState.extensions)
}

export function extensionSentence(state: ChromeExtensionState): string {
  if (state.status === 'published') return 'The Chrome extension is in the Chrome Web Store.'
  if (state.status === 'approved') return 'The Chrome Web Store has accepted the browser extension, and the listing goes live soon.'
  return 'The browser extension is not in a browser store yet.'
}
