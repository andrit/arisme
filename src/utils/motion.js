// Returns true if the user has requested reduced motion in their OS settings
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Returns true if we're likely on a mobile/touch device
export const isMobileDevice = () =>
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || navigator.maxTouchPoints > 0)
