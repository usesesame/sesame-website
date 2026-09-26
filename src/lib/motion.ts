// Header scroll state for the public site. The hero fade is CSS only.
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
