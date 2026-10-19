let frame = 0

export function stopGlide() {
  cancelAnimationFrame(frame)
}

export function glideTo(top: number) {
  stopGlide()
  const from = window.scrollY
  const distance = top - from
  if (Math.abs(distance) < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, top)
    return
  }
  const duration = Math.min(900, 360 + Math.abs(distance) * 0.3)
  const start = performance.now()
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const step = (time: number) => {
    const progress = Math.min(1, (time - start) / duration)
    window.scrollTo(0, from + distance * ease(progress))
    if (progress < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
}

export function stopGlideOnInput() {
  window.addEventListener('wheel', stopGlide, { passive: true })
  window.addEventListener('touchstart', stopGlide, { passive: true })
  window.addEventListener('keydown', stopGlide)
  return () => {
    stopGlide()
    window.removeEventListener('wheel', stopGlide)
    window.removeEventListener('touchstart', stopGlide)
    window.removeEventListener('keydown', stopGlide)
  }
}
