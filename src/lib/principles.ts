import { sourceExcerpt, type SourceExcerpt } from './source-excerpts'

export type Principle = { key: string; title: string; detail: string; excerpts: SourceExcerpt[] }

export const principles: Principle[] = [
  {
    key: 'slow-guess',
    title: 'Guessing your master password is slow',
    detail: 'Sesame turns your master password into the vault key with Argon2id, using 128 MiB of memory and 3 passes. That makes each guess slow for anyone who steals the vault file.',
    excerpts: [sourceExcerpt('kdf-memory'), sourceExcerpt('kdf-passes'), sourceExcerpt('key-derivation')],
  },
  {
    key: 'search',
    title: 'Search does not look at passwords',
    detail: 'Search looks at the title, folder, tags, username, email, address, and notes of a login. It does not look at the password, so nobody can find out a password by typing guesses into search.',
    excerpts: [sourceExcerpt('search-fields')],
  },
  {
    key: 'approval',
    title: 'An approval ignores clicks for the first 750 milliseconds',
    detail: 'When Sesame asks you to approve a fill, it ignores clicks and key presses until its window has been in focus for 750 milliseconds. An accidental click made as the window appears cannot approve anything.',
    excerpts: [sourceExcerpt('approval-delay'), sourceExcerpt('approval-settle')],
  },
  {
    key: 'breach',
    title: 'The breach check sends only 5 characters of a hash',
    detail: 'Sesame hashes the password with SHA-1 on your computer and sends only the first 5 characters of the hash to Have I Been Pwned. The password and the rest of the hash never leave your computer.',
    excerpts: [sourceExcerpt('breach-prefix'), sourceExcerpt('breach-range')],
  },
  {
    key: 'clipboard',
    title: 'Copied passwords are cleared from the clipboard',
    detail: 'Sesame clears a copied password from the clipboard after 30 seconds unless you choose 10 or 60.',
    excerpts: [sourceExcerpt('clipboard-clear')],
  },
]
