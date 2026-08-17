// Scroll motion for the public site. Pages are prerendered, so motion may animate but never gate visibility.
export function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

type QueuedReveal = { node: HTMLElement; delay: number }
const revealQueue = new Map<HTMLElement, number>()
let revealFrame = 0

function flushRevealQueue() {
  revealFrame = 0
  const items: QueuedReveal[] = [...revealQueue].map(([node, delay]) => ({ node, delay }))
  revealQueue.clear()
  items.sort((a, b) => {
    const first = a.node.getBoundingClientRect()
    const second = b.node.getBoundingClientRect()
    return first.top - second.top || first.left - second.left
  })
  items.forEach(({ node, delay }, index) => {
    node.style.setProperty('--reveal-delay', `${delay + index * 70}ms`)
    node.classList.add('is-revealed')
  })
}

function queueReveal(node: HTMLElement, delay: number) {
  revealQueue.set(node, delay)
  if (!revealFrame) revealFrame = requestAnimationFrame(flushRevealQueue)
}

export function reveal(node: HTMLElement, delay = 0) {
  if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) return
  node.classList.add('reveal')
  let revealed = false
  let fallback = 0

  const show = () => {
    if (revealed) return
    revealed = true
    window.clearInterval(fallback)
    queueReveal(node, delay)
    observer.disconnect()
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        show()
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  )
  observer.observe(node)

  fallback = window.setInterval(() => {
    const bounds = node.getBoundingClientRect()
    if (bounds.top <= window.innerHeight * 0.94) show()
  }, 250)

  return {
    destroy: () => {
      window.clearInterval(fallback)
      revealQueue.delete(node)
      observer.disconnect()
    },
  }
}

export function watchScroll(onChange: (scrolled: boolean) => void) {
  if (typeof window === 'undefined') return () => {}

  let scrolled: boolean | null = null
  let queued = false
  const measure = () => {
    queued = false
    const next = window.scrollY > 12
    if (next === scrolled) return
    scrolled = next
    onChange(scrolled)
  }
  const onScroll = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(measure)
  }

  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => window.removeEventListener('scroll', onScroll)
}
