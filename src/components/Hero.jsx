import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import ParticleCanvas from './ParticleCanvas'
import { prefersReducedMotion } from '../utils/motion'

const TOPO_LINES = Array.from({ length: 8 }, (_, i) => ({
  r: 180 + i * 80,
  speed: 12 + i * 4,
  opacity: 0.025 + i * 0.005,
}))

export default function Hero({ mouseRef }) {
  const sectionRef  = useRef(null)
  const line1Ref    = useRef(null)
  const line2Ref    = useRef(null)
  const line3Ref    = useRef(null)
  const subRef      = useRef(null)
  const tagsRef     = useRef(null)
  const scrollRef   = useRef(null)
  const topoRef     = useRef(null)

  // Scroll parallax
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (topoRef.current) {
        topoRef.current.style.transform = `translateY(${y * 0.25}px) scale(1.02)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // GSAP entrance timeline
  useEffect(() => {
    // Reduced motion: snap to final state immediately
    if (prefersReducedMotion()) {
      ;[line1Ref, line2Ref, line3Ref].forEach(ref =>
        ref.current.querySelectorAll('span').forEach(s => { s.style.transform = 'translateY(0)' })
      )
      Object.assign(subRef.current.style, { opacity: 1, transform: 'none' })
      Array.from(tagsRef.current.children).forEach(c => Object.assign(c.style, { opacity: 1, transform: 'none' }))
      scrollRef.current.style.opacity = 1
      return
    }

    const tl = gsap.timeline({ delay: 0.3 })

    // Reveal headline lines one by one
    ;[line1Ref, line2Ref, line3Ref].forEach((ref) => {
      const spans = ref.current.querySelectorAll('span')
      tl.to(spans, {
        y: 0,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.04,
      }, '-=0.7')
    })

    tl.to(subRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.5')

    tl.to(tagsRef.current.children, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.1,
      ease: 'power3.out',
    }, '-=0.4')

    tl.to(scrollRef.current, {
      opacity: 1,
      duration: 0.8,
    }, '-=0.2')
  }, [])

  // Split text helper
  const splitChars = (text) =>
    text.split('').map((ch, i) => (
      <span key={i} style={{ display: 'inline-block', transform: 'translateY(110%)' }}>
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ))

  const tags = ['Web Developer', 'Storyteller', 'Systems Thinker', 'Trail Seeker']

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{
        height:         '100svh',
        minHeight:      '600px',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        alignItems:     'flex-start',
        padding:        '0 var(--sp-hero-x)',
        position:       'relative',
      }}
    >
      {/* Particle background */}
      <ParticleCanvas mouseRef={mouseRef} />

      {/* Topographic rings */}
      <div
        ref={topoRef}
        style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          pointerEvents:  'none',
          transition:     'transform 0.1s linear',
        }}
      >
        <svg
          viewBox="0 0 900 900"
          width="900"
          height="900"
          className="topo-svg"
          style={{ position: 'absolute', right: '-10%', top: '50%', transform: 'translateY(-50%)' }}
        >
          {TOPO_LINES.map((l, i) => (
            <g key={i}>
              <circle
                cx={450} cy={450}
                r={l.r}
                fill="none"
                stroke="#5c8f6a"
                strokeWidth="1"
                opacity={l.opacity}
              />
              <circle
                cx={450} cy={450}
                r={l.r - 15}
                fill="none"
                stroke="#c49a52"
                strokeWidth="0.5"
                strokeDasharray="6 18"
                opacity={l.opacity * 0.6}
              />
            </g>
          ))}
          {/* Crosshair */}
          <line x1="430" y1="450" x2="470" y2="450" stroke="#c49a52" strokeWidth="0.8" opacity="0.3" />
          <line x1="450" y1="430" x2="450" y2="470" stroke="#c49a52" strokeWidth="0.8" opacity="0.3" />
          <circle cx={450} cy={450} r={4} fill="none" stroke="#c49a52" strokeWidth="0.8" opacity="0.4" />
        </svg>
      </div>

      {/* Gradient fade at bottom */}
      <div style={{
        position:   'absolute',
        bottom:     0,
        left:       0,
        right:      0,
        height:     '30%',
        background: 'linear-gradient(to bottom, transparent, var(--bg))',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '820px' }}>
        {/* Eyebrow */}
        <div className="section-label" style={{ marginBottom: '2rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.2em', color: 'var(--green)' }}>
            &lt;hello world /&gt;
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, lineHeight: 1.0, marginBottom: '2.5rem' }}>
          <div ref={line1Ref} className="clip-reveal" style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', marginBottom: '0.1em' }}>
            {splitChars('Building')}
          </div>
          <div ref={line2Ref} className="clip-reveal" style={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)', marginBottom: '0.1em', paddingLeft: '1ch' }}>
            <span style={{ display: 'inline-block', transform: 'translateY(110%)', fontStyle: 'italic', color: 'var(--amber)' }}>Worlds</span>
            <span style={{ display: 'inline-block', transform: 'translateY(110%)' }}>,</span>
          </div>
          <div ref={line3Ref} className="clip-reveal" style={{ fontSize: 'clamp(2.5rem, 6.5vw, 5.8rem)', color: 'var(--fg-muted)' }}>
            {splitChars('one commit at a time.')}
          </div>
        </h1>

        {/* Subline */}
        <p
          ref={subRef}
          style={{
            opacity:       0,
            transform:     'translateY(20px)',
            fontFamily:    'var(--font-body)',
            fontSize:      'clamp(1rem, 1.5vw, 1.2rem)',
            fontWeight:    300,
            color:         'var(--fg-muted)',
            maxWidth:      '480px',
            marginBottom:  '2.5rem',
            lineHeight:    1.7,
          }}
        >
          I craft experiences across the digital and the physical —
          from systems and interfaces to stories and mountain ridges.
        </p>

        {/* Tags */}
        <div ref={tagsRef} style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                opacity:       0,
                transform:     'translateY(12px)',
                fontFamily:    'var(--font-mono)',
                fontSize:      '0.68rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding:       '0.5rem 1rem',
                border:        '1px solid var(--border-hover)',
                borderRadius:  '2px',
                color:         'var(--fg-muted)',
                background:    'rgba(92,143,106,0.04)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        style={{
          opacity:        0,
          position:       'absolute',
          bottom:         '2.5rem',
          left:           'var(--sp-hero-x)',
          display:        'flex',
          alignItems:     'center',
          gap:            '1rem',
          fontFamily:     'var(--font-mono)',
          fontSize:       '0.65rem',
          letterSpacing:  '0.15em',
          color:          'var(--fg-muted)',
          textTransform:  'uppercase',
        }}
      >
        <ScrollLine />
        Scroll to explore
      </div>
    </section>
  )
}

function ScrollLine() {
  return (
    <div style={{ position: 'relative', width: '40px', height: '1px', background: 'var(--fg-dim)', overflow: 'hidden' }}>
      <div
        style={{
          position:   'absolute',
          top:        0,
          left:       0,
          width:      '100%',
          height:     '100%',
          background: 'var(--green)',
          animation:  'scrollPulse 2s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes scrollPulse {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
