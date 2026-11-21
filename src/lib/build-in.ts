export function buildIn(node: HTMLElement) {
  if (typeof IntersectionObserver === 'undefined') return {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return {}
  if (node.getBoundingClientRect().top < window.innerHeight * 0.92) return {}

  node.dataset.build = 'waiting'
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      node.dataset.build = 'in'
      observer.disconnect()
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  )
  observer.observe(node)
  return {
    destroy() {
      observer.disconnect()
    },
  }
}
