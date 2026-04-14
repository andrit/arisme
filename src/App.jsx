import { useEffect, useRef, useState, useCallback } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { LenisContext } from './LenisContext'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import About        from './components/About'
import SkillMap     from './components/SkillMap'
import Worlds       from './components/Worlds'
import Contact      from './components/Contact'
import SectionDots  from './components/SectionDots'

gsap.registerPlugin(ScrollTrigger)

// Sections in order — used by keyboard nav + section dots
const SECTIONS = [
  { id: 'hero',    label: 'Home'    },
  { id: 'about',   label: 'About'   },
  { id: 'craft',   label: 'Craft'   },
  { id: 'worlds',  label: 'Worlds'  },
  { id: 'contact', label: 'Contact' },
]

export default function App() {
  const cursorDotRef  = useRef(null)
  const cursorRingRef = useRef(null)
  const mouseRef      = useRef({ x: -1000, y: -1000 })
  const lenisRef      = useRef(null)
  const [activeSection, setActiveSection] = useState('hero')

  // ── Fix 1 + 4: Lenis with tuned config, exposed via ref ──────
  useEffect(() => {
    const lenis = new Lenis({
      duration:        0.9,
      easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel:     true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.8,
      infinite:        false,
    })

    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // ── Active section tracker (for dots + keyboard index) ───────
  useEffect(() => {
    const observers = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.1 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(o => o?.disconnect())
  }, [])

  // ── Fix 2: Keyboard navigation ────────────────────────────────
  useEffect(() => {
    const scrollToSection = (id) => {
      const el = document.getElementById(id)
      if (!el || !lenisRef.current) return
      lenisRef.current.scrollTo(el, { offset: -80 })
    }

    const stepSection = (dir) => {
      const idx = SECTIONS.findIndex(s => s.id === activeSection)
      const next = SECTIONS[idx + dir]
      if (next) scrollToSection(next.id)
    }

    const onKeyDown = (e) => {
      // Don't hijack when user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return

      switch (e.key) {
        // PageDown/PageUp and Space jump sections intentionally.
        // ArrowDown/ArrowUp are left for natural Lenis scroll —
        // intercepting them caused entire tall sections to be skipped.
        case 'PageDown':
          e.preventDefault()
          stepSection(+1)
          break
        case 'PageUp':
          e.preventDefault()
          stepSection(-1)
          break
        case ' ':
          e.preventDefault()
          stepSection(e.shiftKey ? -1 : +1)
          break
        case 'Home':
          e.preventDefault()
          scrollToSection('hero')
          break
        case 'End':
          e.preventDefault()
          scrollToSection('contact')
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeSection])

  // ── Custom cursor ─────────────────────────────────────────────
  useEffect(() => {
    const dot  = cursorDotRef.current
    const ring = cursorRingRef.current
    if (!dot || !ring) return

    let mx = -100, my = -100, rx = -100, ry = -100, raf

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      mouseRef.current = { x: mx, y: my }
    }

    const animate = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      dot.style.left   = `${mx}px`
      dot.style.top    = `${my}px`
      ring.style.left  = `${rx}px`
      ring.style.top   = `${ry}px`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove)
    animate()
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef}>
      <div className="noise-overlay" />
      <div ref={cursorDotRef}  className="cursor-dot"  />
      <div ref={cursorRingRef} className="cursor-ring" />

      <Navbar />

      {/* Fix 3: Section dots */}
      <SectionDots
        sections={SECTIONS}
        active={activeSection}
        lenisRef={lenisRef}
      />

      <main>
        <Hero    mouseRef={mouseRef} />
        <About   />
        <SkillMap />
        <Worlds  />
        <Contact />
      </main>
    </LenisContext.Provider>
  )
}
