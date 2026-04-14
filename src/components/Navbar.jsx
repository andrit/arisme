import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useLenis } from '../LenisContext'

const links = [
  { label: 'About',   href: '#about'   },
  { label: 'Craft',   href: '#craft'   },
  { label: 'Worlds',  href: '#worlds'  },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const navRef     = useRef(null)
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)
  const lenisRef = useLenis()

  useEffect(() => {
    gsap.from(navRef.current.children, {
      y: -20, opacity: 0, duration: 1, stagger: 0.08, ease: 'power3.out', delay: 2.4,
    })
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const scrollTo = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (!el) return
    if (lenisRef?.current) {
      lenisRef.current.scrollTo(el, { offset: -80 })
    } else {
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position:       'fixed',
          top: 0, left: 0, right: 0,
          zIndex:         500,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '1.4rem var(--sp-section-x)',
          borderBottom:   scrolled ? '1px solid rgba(240,234,216,0.06)' : '1px solid transparent',
          background:     scrolled ? 'rgba(7,8,8,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          transition:     'all 0.4s ease',
        }}
      >
        {/* Logo */}
        <a href="#hero" onClick={(e) => scrollTo(e, '#hero')} style={{
          fontFamily: 'var(--font-display)', fontSize: '1.25rem',
          letterSpacing: '0.02em', color: 'var(--fg)',
        }}>
          <span style={{ color: 'var(--amber)' }}>◈</span> Dev / Wanderer
        </a>

        {/* Desktop links */}
        <ul className="desktop-nav-links" style={{ display: 'flex', gap: '2.5rem', listStyle: 'none' }}>
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={(e) => scrollTo(e, l.href)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--fg-muted)', transition: 'color 0.25s',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--fg)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--fg-muted)'}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger — mobile only (CSS hides on desktop) */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile overlay menu */}
      <div className={`mobile-nav-overlay${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => scrollTo(e, l.href)}
          >
            {l.label}
          </a>
        ))}
      </div>
    </>
  )
}
