import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../utils/motion'
gsap.registerPlugin(ScrollTrigger)

const PROJECTS = [
  {
    num:    '01',
    title:  'Atlas — Knowledge OS',
    type:   'Systems / App',
    desc:   'A personal knowledge management system built on graph-based relationships. Every note is a node. Every connection is intentional.',
    stack:  ['React', 'Neo4j', 'Node.js'],
    accent: '#5c8f6a',
    glyph:  '⬡',
  },
  {
    num:    '02',
    title:  'Meridian Design System',
    type:   'Frontend / UI',
    desc:   'A component library born from frustration with inconsistency. Merges engineering precision with editorial sensibility.',
    stack:  ['React', 'Storybook', 'CSS'],
    accent: '#c49a52',
    glyph:  '◎',
  },
  {
    num:    '03',
    title:  'TrailLog',
    type:   'App / Mapping',
    desc:   'An offline-first hiking journal that syncs topographic data with personal notes. Built for people who prefer trails to timelines.',
    stack:  ['React Native', 'SQLite', 'MapLibre'],
    accent: '#7dba8e',
    glyph:  '◈',
  },
  {
    num:    '04',
    title:  'Fable Engine',
    type:   'Storytelling / Tool',
    desc:   'An experimental narrative tool that uses graph theory to model character relationships, plot threads, and world-building constraints.',
    stack:  ['Next.js', 'D3.js', 'PostgreSQL'],
    accent: '#c9562e',
    glyph:  '◆',
  },
]

function ProjectCard({ project, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    gsap.from(cardRef.current, {
      y: 60,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: cardRef.current,
        start: 'top 88%',
      },
      delay: index * 0.08,
    })
  }, [index])

  return (
    <article
      ref={cardRef}
      style={{
        border:        '1px solid var(--border)',
        borderRadius:  '4px',
        padding:       '2.5rem',
        background:    'var(--bg-1)',
        position:      'relative',
        overflow:      'hidden',
        cursor:        'default',
        transition:    'border-color 0.4s, transform 0.4s var(--ease-out-expo)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${project.accent}44`
        e.currentTarget.style.transform   = 'translateY(-4px)'
        e.currentTarget.querySelector('.card-glow').style.opacity = '1'
        e.currentTarget.querySelector('.card-num').style.color    = project.accent
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform   = 'translateY(0)'
        e.currentTarget.querySelector('.card-glow').style.opacity = '0'
        e.currentTarget.querySelector('.card-num').style.color    = 'var(--fg-dim)'
      }}
    >
      {/* Glow blob on hover */}
      <div
        className="card-glow"
        style={{
          position:         'absolute',
          top:              '-40%',
          right:            '-20%',
          width:            '280px',
          height:           '280px',
          borderRadius:     '50%',
          background:       `radial-gradient(circle, ${project.accent}18 0%, transparent 70%)`,
          opacity:          0,
          transition:       'opacity 0.5s',
          pointerEvents:    'none',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <span
          className="card-num"
          style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.65rem',
            letterSpacing: '0.15em',
            color:         'var(--fg-dim)',
            transition:    'color 0.3s',
          }}
        >{project.num}</span>
        <span style={{
          fontFamily:    'var(--font-mono)',
          fontSize:      '0.65rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         'var(--fg-muted)',
          padding:       '0.3rem 0.7rem',
          border:        '1px solid var(--border)',
          borderRadius:  '2px',
        }}>{project.type}</span>
      </div>

      <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{project.glyph}</div>

      <h3 style={{
        fontFamily:   'var(--font-display)',
        fontSize:     '1.7rem',
        fontWeight:   300,
        marginBottom: '1rem',
        lineHeight:   1.2,
      }}>{project.title}</h3>

      <p style={{
        color:        'var(--fg-muted)',
        fontSize:     '0.95rem',
        lineHeight:   1.7,
        marginBottom: '2rem',
      }}>{project.desc}</p>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {project.stack.map((t) => (
          <span key={t} style={{
            fontFamily:    'var(--font-mono)',
            fontSize:      '0.62rem',
            letterSpacing: '0.1em',
            padding:       '0.3rem 0.7rem',
            background:    `${project.accent}14`,
            border:        `1px solid ${project.accent}30`,
            borderRadius:  '2px',
            color:         project.accent,
          }}>{t}</span>
        ))}
      </div>
    </article>
  )
}

export default function Craft() {
  const sectionRef  = useRef(null)
  const headRef     = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(headRef.current.children, {
        y: 50,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headRef.current,
          start: 'top 80%',
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="craft"
      ref={sectionRef}
      style={{
        padding:    '10rem 3rem',
        background: 'var(--bg-1)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div ref={headRef}>
          <div className="section-label">Selected Work</div>
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     'clamp(2.8rem, 5vw, 4.5rem)',
            fontWeight:   300,
            marginBottom: '1rem',
            lineHeight:   1.1,
          }}>
            The things I've{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--green-light)' }}>built</span>
          </h2>
          <p style={{
            color:        'var(--fg-muted)',
            maxWidth:     '500px',
            marginBottom: '4rem',
            lineHeight:   1.8,
          }}>
            Projects that live at the intersection of systems thinking, 
            storytelling, and obsessive craft.
          </p>
        </div>

        {/* Project grid */}
        <div className="craft-grid">
          {PROJECTS.map((p, i) => (
            <ProjectCard key={p.num} project={p} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <a
            href="https://github.com"
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:           '0.75rem',
              fontFamily:    'var(--font-mono)',
              fontSize:      '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color:         'var(--fg)',
              padding:       '1rem 2rem',
              border:        '1px solid var(--border-hover)',
              borderRadius:  '2px',
              transition:    'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--green)'
              e.currentTarget.style.color       = 'var(--green)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)'
              e.currentTarget.style.color       = 'var(--fg)'
            }}
          >
            ↗ View all on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}
