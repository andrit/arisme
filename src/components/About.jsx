import { useEffect, useRef, useState, useCallback, forwardRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../utils/motion'
gsap.registerPlugin(ScrollTrigger)

const SKILLS = [
  'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL',
  'Docker', 'AWS', 'Next.js', 'Three.js', 'Python',
  'Redis', 'WebSockets', 'Figma', 'Obsidian', 'Git',
  'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'GraphQL',
  'Docker', 'AWS', 'Next.js', 'Three.js', 'Python',
  'Redis', 'WebSockets', 'Figma', 'Obsidian', 'Git',
]

// Full pool — 12 stats rotate across 4 visible slots
const ALL_STATS = [
  { value: '8+',    label: 'Years Building'         },
  { value: '1',     label: 'Unfinished Novel'        },
  { value: '40+',   label: 'Collaborations'          },
  { value: '∞',     label: 'Stories Told'            },
  { value: '∞',     label: 'Problems Reframed'       },
  { value: '200+',  label: 'Miles Hiked'             },
  { value: '7',     label: 'Domains Mapped'          },
  { value: '1000+', label: 'Lines of Code'           },
  { value: '5',     label: 'Videos Produced'         },
  { value: '20+',   label: 'Cities Explored'         },
  { value: '100+',  label: 'Products Photographed'   },
  { value: '50+',   label: 'APIs Connected'          },
]
const SLOT_COUNT   = 4
const INTERVAL_MS  = 4500   // ms between each roll
const ANIM_DURATION = 0.55  // seconds for slide transition


// ── Rotating stat grid ────────────────────────────────────────
// Slots hold indices into ALL_STATS. On each interval one slot
// rolls its content out (up) and a new stat rolls in (from below).
const StatGrid = forwardRef(function StatGrid(_, ref) {
  // Active indices — first SLOT_COUNT stats start visible
  const [slots, setSlots] = useState(() =>
    Array.from({ length: SLOT_COUNT }, (_, i) => i)
  )
  // Which pool index comes next (cycles through ALL_STATS)
  const nextIdx    = useRef(SLOT_COUNT)
  // Which slot was last animated (avoid repeating same slot)
  const lastSlot   = useRef(-1)
  // Refs to the inner content divs for GSAP targeting
  const cellRefs   = useRef([])
  const reduced    = prefersReducedMotion()

  const roll = useCallback(() => {
    if (reduced) return

    // Pick a random slot that isn't the one we just animated
    let slot
    do { slot = Math.floor(Math.random() * SLOT_COUNT) }
    while (slot === lastSlot.current)
    lastSlot.current = slot

    const cell     = cellRefs.current[slot]
    if (!cell) return

    const incoming = nextIdx.current % ALL_STATS.length
    nextIdx.current++

    // Slide current content up and out
    gsap.to(cell, {
      y: '-105%',
      opacity: 0,
      duration: ANIM_DURATION,
      ease: 'power3.in',
      onComplete: () => {
        // Swap stat index
        setSlots(prev => {
          const next = [...prev]
          next[slot] = incoming
          return next
        })
        // Reset to below, then slide up into place
        gsap.set(cell, { y: '105%', opacity: 0 })
        gsap.to(cell, {
          y: '0%',
          opacity: 1,
          duration: ANIM_DURATION,
          ease: 'power3.out',
        })
      },
    })
  }, [reduced])

  useEffect(() => {
    if (reduced) return
    const timer = setInterval(roll, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [roll, reduced])

  return (
    <div
      ref={ref}
      className="about-stats-grid"
      style={{
        gap:          '1px',
        background:   'var(--border)',
        border:       '1px solid var(--border)',
        borderRadius: '4px',
        overflow:     'hidden',
        maxWidth:     '1100px',
        margin:       '6rem auto 0',
      }}
    >
      {slots.map((statIdx, slotIdx) => {
        const s = ALL_STATS[statIdx]
        return (
          <div
            key={slotIdx}
            style={{
              padding:    '2.5rem',
              background: 'var(--bg)',
              textAlign:  'center',
              overflow:   'hidden',  // clips the slide in/out
            }}
          >
            {/* Inner wrapper — GSAP animates translateY on this */}
            <div ref={el => { cellRefs.current[slotIdx] = el }}>
              <div style={{
                fontFamily:   'var(--font-display)',
                fontSize:     '3.5rem',
                fontWeight:   300,
                color:        'var(--amber)',
                lineHeight:   1,
                marginBottom: '0.5rem',
              }}>{s.value}</div>
              <div style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '0.68rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         'var(--fg-muted)',
              }}>{s.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
})

export default function About() {
  const sectionRef = useRef(null)
  const leftRef    = useRef(null)
  const rightRef   = useRef(null)
  const statsRef   = useRef(null)
  const lineRef    = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return   // skip all entry animations
    const ctx = gsap.context(() => {
      // Left column slides in
      gsap.from(leftRef.current.children, {
        x: -60,
        opacity: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      })

      // Right column fades up
      gsap.from(rightRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 1.0,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })

      // Stats counter-like reveal
      gsap.from(statsRef.current.children, {
        scale: 0.8,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 85%',
        },
      })

      // Divider line grow
      gsap.from(lineRef.current, {
        scaleX: 0,
        duration: 1.4,
        ease: 'power3.inOut',
        transformOrigin: 'left center',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        padding:    'var(--sp-section-y) var(--sp-section-x)',
        background: 'var(--bg)',
      }}
    >
      <div
        ref={lineRef}
        style={{
          width:         '100%',
          height:        '1px',
          background:    'linear-gradient(to right, var(--green), transparent)',
          marginBottom:  '5rem',
        }}
      />

      {/* Main two-column layout */}
      <div className="about-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Left */}
        <div ref={leftRef}>
          <div className="section-label">About Me</div>
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     'clamp(2.5rem, 4.5vw, 3.8rem)',
            fontWeight:   300,
            lineHeight:   1.15,
            marginBottom: '2rem',
          }}>
            I don't just write code —{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>I architect</span>{' '}
            experiences.
          </h2>
          <p style={{
            color:        'var(--fg-muted)',
            lineHeight:   1.9,
            marginBottom: '1.5rem',
            fontSize:     '1.05rem',
          }}>
            I'm a web developer who sees systems everywhere — in codebases, in narratives, 
            in the trails that wind through fog-covered ridges. I believe the best interfaces 
            tell stories, and the best stories have elegant architecture.
          </p>
          <p style={{ color: 'var(--fg-muted)', lineHeight: 1.9, fontSize: '1.05rem' }}>
            By day I build scalable web applications with the kind of obsessive attention to 
            detail that comes from treating every project like a chapter in an unfolding world. 
            By night, I fill notebooks with strange maps and stranger ideas.
          </p>
        </div>

        {/* Right */}
        <div ref={rightRef} style={{ paddingTop: '3rem' }}>
          {/* Quote */}
          <blockquote style={{
            fontFamily:   'var(--font-display)',
            fontSize:     '1.5rem',
            fontStyle:    'italic',
            fontWeight:   300,
            color:        'var(--fg)',
            borderLeft:   '2px solid var(--green)',
            paddingLeft:  '1.5rem',
            marginBottom: '3rem',
            lineHeight:   1.5,
          }}>
            "The map is not the territory, but a good map makes you want to explore."
          </blockquote>

          {/* What I bring */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: '⬡', title: 'Systems Architecture', desc: 'Designing things that scale — technically and conceptually.' },
              { icon: '◎', title: 'Frontend Craft',        desc: 'Interfaces that feel alive, responsive to intent.' },
              { icon: '◈', title: 'Narrative Thinking',    desc: 'Every product has a story. I help tell it clearly.' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display:       'flex',
                  gap:           '1.2rem',
                  alignItems:    'flex-start',
                  padding:       '1.2rem',
                  border:        '1px solid var(--border)',
                  borderRadius:  '4px',
                  background:    'rgba(92,143,106,0.03)',
                  transition:    'border-color 0.3s, background 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(92,143,106,0.3)'
                  e.currentTarget.style.background   = 'rgba(92,143,106,0.06)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.background   = 'rgba(92,143,106,0.03)'
                }}
              >
                <span style={{ fontSize: '1.2rem', color: 'var(--green)', marginTop: '0.1rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--fg-muted)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats row — rotating departure board */}
      <StatGrid ref={statsRef} />

      {/* Skills marquee */}
      <div style={{
        marginTop:  '5rem',
        overflow:   'hidden',
        borderTop:  '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding:    '1.4rem 0',
      }}>
        <div className="marquee-track">
          {SKILLS.map((s, i) => (
            <span key={i} style={{
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         i % 3 === 0 ? 'var(--green)' : 'var(--fg-muted)',
              marginRight:   '3.5rem',
              whiteSpace:    'nowrap',
            }}>
              {i % 5 === 0 ? '◆ ' : '· '}{s}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
