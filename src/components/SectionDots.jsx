import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function SectionDots({ sections, active, lenisRef }) {
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.from(containerRef.current, {
      x: 20, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 2.8,
    })
  }, [])

  const goTo = (id) => {
    const el = document.getElementById(id)
    if (!el || !lenisRef.current) return
    lenisRef.current.scrollTo(el, { offset: -80 })
  }

  return (
    <nav
      ref={containerRef}
      aria-label="Section navigation"
      style={{
        position:      'fixed',
        right:         '1.6rem',
        top:           '50%',
        transform:     'translateY(-50%)',
        zIndex:        400,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'flex-end',
        gap:           '0rem',  // gap handled by touch-target padding
      }}
    >
      {sections.map(({ id, label }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => goTo(id)}
            aria-label={`Go to ${label}`}
            aria-current={isActive ? 'true' : undefined}
            style={{
              all:           'unset',
              cursor:        'none',
              display:       'flex',
              alignItems:    'center',
              justifyContent: 'flex-end',
              gap:           '0.55rem',
              flexDirection: 'row-reverse',
              // 44×44 minimum touch target — invisible padding around the small dot
              minWidth:      '44px',
              minHeight:     '44px',
              padding:       '0 4px',
            }}
          >
            {/* Label */}
            <span
              style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '0.6rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color:         isActive ? 'var(--amber)' : 'var(--fg-muted)',
                opacity:       isActive ? 1 : 0,
                transform:     isActive ? 'translateX(0)' : 'translateX(6px)',
                transition:    'opacity 0.35s, transform 0.35s, color 0.35s',
                pointerEvents: 'none',
                whiteSpace:    'nowrap',
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <span
              style={{
                display:      'block',
                width:        isActive ? '8px' : '5px',
                height:       isActive ? '8px' : '5px',
                borderRadius: '50%',
                background:   isActive ? 'var(--amber)' : 'transparent',
                border:       isActive ? '1px solid var(--amber)' : '1px solid var(--fg-muted)',
                transition:   'all 0.35s var(--ease-out-expo)',
                flexShrink:   0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--fg)'
                  e.currentTarget.style.background  = 'rgba(240,234,216,0.15)'
                  const lbl = e.currentTarget.parentElement.querySelector('span')
                  if (lbl) { lbl.style.opacity = '0.6'; lbl.style.transform = 'translateX(0)' }
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--fg-muted)'
                  e.currentTarget.style.background  = 'transparent'
                  const lbl = e.currentTarget.parentElement.querySelector('span')
                  if (lbl) { lbl.style.opacity = '0'; lbl.style.transform = 'translateX(6px)' }
                }
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}
