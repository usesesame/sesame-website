export type SupportGuide = { key: string; title: string; summary: string; steps: string[]; note?: string }
export type SupportGroup = { key: string; title: string; guides: SupportGuide[] }

export const supportGroups: SupportGroup[] = [
  {
    key: 'unlock',
    title: 'Unlocking your vault',
    guides: [
      {
        key: 'forgot-master-password',
        title: 'I forgot my master password',
        summary: 'Your recovery kit opens the vault and lets you set a new password.',
        steps: [
          'On the unlock screen, choose Use recovery kit instead.',
          'Type the recovery kit you saved when you created the vault.',
          'Set a new master password.',
        ],
        note: 'If you lose both the master password and the recovery kit, nobody can open the vault, including us.',
      },
      {
        key: 'lost-recovery-kit',
        title: 'I lost my recovery kit but know my master password',
        summary: 'You can ask for a new kit, and it is ready after 72 hours.',
        steps: [
          'Unlock the vault with your master password.',
          'Open Settings, then Security, and ask for a new recovery kit.',
          'Wait 72 hours. Every unlock warns you until then, so you can cancel a request you did not make.',
          'Connect to the internet when the wait ends, because Sesame checks the time with two independent servers before it issues the kit.',
        ],
        note: 'Backups made before the new kit still open with the old one, so delete them or keep them offline.',
      },
      {
        key: 'pin-or-hello',
        title: 'My PIN or Windows Hello stopped working',
        summary: 'A PIN and Windows Hello only work on the computer where you set them up. Your master password works everywhere.',
        steps: [
          'Unlock with your master password or your recovery kit.',
          'Open Settings, then Security, and set the PIN or Windows Hello up again.',
          'On Linux, install gnome-keyring or kwallet first, because PIN unlock needs a Secret Service wallet.',
        ],
        note: 'A PIN and a Windows Hello setup stay on the device that created them, so a new computer needs its own.',
      },
    ],
  },
  {
    key: 'install',
    title: 'Installing and updating',
    guides: [
      {
        key: 'smartscreen',
        title: 'Windows warns me about the installer',
        summary: 'The installer is not Authenticode signed yet, so check its checksum before you run it.',
        steps: [
          'Open PowerShell in your downloads folder and run Get-FileHash with the name of the installer.',
          'Compare the result with the SHA-256 for that file on the releases page. Letter case does not matter.',
          'If they match, choose More info in the warning and then Run anyway.',
          'If they differ, delete the file and download it again from the releases page.',
        ],
      },
      {
        key: 'linux-checksum',
        title: 'Check a Linux download',
        summary: 'Every package on the releases page lists its SHA-256.',
        steps: [
          'Run sha256sum with the name of the package you downloaded.',
          'Compare the result with the SHA-256 for that file on the releases page.',
          'For the AppImage, mark the file executable and run it. It needs GLib 2.80 or newer.',
        ],
      },
      {
        key: 'update',
        title: 'Update Sesame',
        summary: 'Windows updates from inside the app, and Linux packages are downloaded by hand.',
        steps: [
          'On Windows, open Settings and choose Check now under Desktop updates.',
          'On Linux, download the new package from the releases page and install it over the old one.',
          'After you replace an AppImage, start it once so it refreshes the browser helper.',
        ],
      },
    ],
  },
  {
    key: 'browser',
    title: 'Browser extension',
    guides: [
      {
        key: 'extension-cannot-reach',
        title: 'The extension cannot reach Sesame',
        summary: 'The extension talks to the installed desktop app on the same computer.',
        steps: [
          'Start the installed Sesame app and unlock it.',
          'In Sesame, open Settings, then Browser, and read what Browser autofill setup says. Choose Recheck desktop setup if it reports an incomplete installation.',
          'Close any second copy of Sesame, because only one can serve the extension, and then restart the one you use.',
          'On Linux, use the deb or rpm build of Sesame and a browser from your system packages or its vendor. A Snap or Flatpak browser cannot reach desktop apps.',
        ],
      },
      {
        key: 'nothing-fills',
        title: 'Nothing fills when I choose Fill',
        summary: 'Every fill waits for your approval in the Sesame window.',
        steps: [
          'Look at the Sesame window. It names the page that is asking and waits for your answer.',
          'Wait a moment before you click, because an approval ignores clicks for the first 750 milliseconds.',
          'Check the Browser filling rule of the login. A login set to This address only does not fill on another address of the same site.',
        ],
        note: 'You can also fill with Alt+Shift+L on Windows and Linux.',
      },
    ],
  },
  {
    key: 'moving',
    title: 'Moving, importing, and backups',
    guides: [
      {
        key: 'new-computer',
        title: 'Move Sesame to a new computer',
        summary: 'An encrypted backup contains your whole vault.',
        steps: [
          'On the old computer, open Backups and choose Export backup. Save the file to a drive you can carry.',
          'Install Sesame on the new computer.',
          'On the welcome screen, choose Restore from a backup and pick the file.',
          'Have your recovery kit at hand, because you need it when a vault moves to a different computer.',
        ],
      },
      {
        key: 'import-missing',
        title: 'My import left something out',
        summary: 'Sesame shows what it will add before it saves anything.',
        steps: [
          'Read the list in Check this import. It counts what is added and what Sesame cannot import yet.',
          'Keep anything that was not added in your old manager until you have saved it somewhere else.',
          'For Bitwarden, export JSON instead of CSV, because the JSON export also carries notes, cards, identities, and SSH keys.',
          'Delete the export file when you are done, because exports are usually readable plaintext.',
        ],
      },
      {
        key: 'backup-drill',
        title: 'Check that a backup really works',
        summary: 'A recovery drill opens a backup without changing your vault.',
        steps: [
          'Open Backups and choose Test a backup.',
          'Pick the backup file. Sesame opens it and leaves your vault as it is.',
          'Keep two copies of the backup in separate places.',
        ],
      },
    ],
  },
  {
    key: 'linux',
    title: 'Linux',
    guides: [
      {
        key: 'linux-lock',
        title: 'The vault does not lock by itself',
        summary: 'Some Linux desktops do not report idle time.',
        steps: [
          'Choose Lock vault in the sidebar before you leave the computer.',
          'Locking on inactivity is built for GNOME and KDE, so on another desktop lock the vault yourself each time.',
        ],
      },
      {
        key: 'wayland-shortcut',
        title: 'The quick access shortcut does nothing',
        summary: 'Wayland has no global shortcut.',
        steps: [
          'Open quick access from the tray icon.',
          'Or start Sesame with GDK_BACKEND=x11 to get the shortcut back. The AppImage always starts that way.',
        ],
      },
    ],
  },
]
