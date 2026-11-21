<script lang="ts">
  import type { FeatureIconName } from './lib/product-facts'

  const { name, size = 20 }: { name: FeatureIconName; size?: number } = $props()
</script>

<svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
  {#if name === 'vault'}
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
    <path d="M8 4v5h8V4M8 14h.01M12 14h.01M16 14h.01" />
  {:else if name === 'import'}
    <path d="M12 4v10.5M8 10.5l4 4 4-4" />
    <path d="M4.5 16v2.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V16" />
  {:else if name === 'card'}
    <rect x="3" y="5.5" width="18" height="13" rx="2.2" />
    <path d="M3 9.5h18M6 14.5h4" />
  {:else if name === 'shield'}
    <path d="M12 3.5 19 6v5.1c0 4.2-2.7 7.6-7 9.4-4.3-1.8-7-5.2-7-9.4V6l7-2.5Z" />
    <path d="m9.3 12.1 1.8 1.8 3.8-4" />
  {:else if name === 'key'}
    <circle cx="8" cy="15.5" r="3.5" />
    <path d="m10.5 13 7.8-7.8M15.7 7.8l2.2 2.2M13.5 10l2.2 2.2" />
  {:else if name === 'archive'}
    <path d="M4 8.5h16v11H4zM3 4.5h18v4H3zM10 13h4" />
  {:else if name === 'lock'}
    <rect x="5" y="10" width="14" height="10" rx="2" />
    <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
  {:else if name === 'monitor'}
    <rect x="3" y="4.5" width="18" height="12" rx="2" />
    <path d="M8.5 20h7M12 16.5V20M9.3 10.6l1.8 1.8 3.6-3.8" />
  {:else if name === 'versions'}
    <path d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20M20.5 16.5H7" />
  {:else if name === 'file-key'}
    <path d="M6 3.5h8l4 4V20H6zM14 3.5v4h4" />
    <circle cx="10" cy="14" r="1.8" />
    <path d="M11.4 15.4 14.5 18M13 16.7l1.3-1.3" />
  {:else if name === 'server'}
    <rect x="3.5" y="4.5" width="17" height="6" rx="1.8" />
    <rect x="3.5" y="13.5" width="17" height="6" rx="1.8" />
    <path d="M7 7.5h.01M7 16.5h.01" />
  {:else if name === 'cloud'}
    <path d="M7.5 18.5h9.8a3.7 3.7 0 0 0 .6-7.35 5.6 5.6 0 0 0-10.9-1.1 4.3 4.3 0 0 0 .5 8.45Z" />
  {/if}
</svg>
