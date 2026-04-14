import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import MindMapAnimation  from './three/MindMapAnimation'
import OctagramAnimation from './three/OctagramAnimation'
import MountainAnimation from './three/MountainAnimation'
import { useIsMobile }   from '../hooks/useIsMobile'
import { prefersReducedMotion } from '../utils/motion'

gsap.registerPlugin(ScrollTrigger)

const WORLDS = [
  {
    id:        'storytelling',
    label:     '01 — The Storyteller',
    title:     'Every system has a narrative',
    body:      `I've been building fictional worlds since before I could write code. The skills that make a story immersive — pacing, tension, consequence — are the same ones that make software feel alive. The veins of every system are full of story.`,
    tags:      ['World-building', 'Interactive Fiction', 'Narrative Design', 'Lore'],
    color:     '#c49a52',
    side:      'left',
    animEntry: 80,
    bg:        'radial-gradient(ellipse at top left, rgba(196,154,82,0.07), transparent 60%)',
  },
  {
    id:        'systems',
    label:     '02 — The Systems Thinker',
    title:     'Complexity made navigable',
    body:      `I'm drawn to the hidden architecture of things — organizing the chaos to invoke emergent connections between systems and ideas that aren't obvious until rendered visible. I see feedback loops in everything and can't resist asking what's governing the governors.`,
    tags:      ['Knowledge Graphs', 'Obsidian', 'Second-brain', 'Zettelkasten'],
    color:     '#5c8f6a',
    side:      'right',
    animEntry: -80,
    bg:        'radial-gradient(ellipse at top right, rgba(92,143,106,0.07), transparent 60%)',
  },
  {
    id:        'hiking',
    label:     '03 — The Trail Seeker',
    title:     'The wilderness is a debugger',
    body:      `Solvitur ambulando. It is solved by walking. Hiking has taught me how to carry only what matters, navigate in the absence of signals, and find clarity where discomfort lives. My best architectural decisions happen at elevation, far from a keyboard.`,
    tags:      ['Mountains', 'Navigation', 'Exploration', 'Rivers'],
    color:     '#7dba8e',
    side:      'left',
    animEntry: -80,
    bg:        'radial-gradient(ellipse at bottom left, rgba(125,186,142,0.07), transparent 60%)',
  },
]

const ANIM_MAP = {
  storytelling: MindMapAnimation,
  systems:      OctagramAnimation,
  hiking:       MountainAnimation,
}

function WorldPanel({ world }) {
  const panelRef    = useRef(null)
  const textRef     = useRef(null)
  const animWrapRef = useRef(null)
  const lineRef     = useRef(null)
  const isMobile    = useIsMobile()
  const isRight     = world.side === 'right'
  const AnimComp    = ANIM_MAP[world.id]

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(textRef.current.children, {
        x: isMobile ? 0 : (isRight ? 60 : -60),
        y: isMobile ? 30 : 0,
        opacity:  0,
        duration: 0.9,
        stagger:  0.12,
        ease:     'power3.out',
        scrollTrigger: { trigger: panelRef.current, start: 'top 78%' },
      })

      gsap.from(animWrapRef.current, {
        x:        isMobile ? 0 : world.animEntry,
        y:        isMobile ? 40 : 0,
        duration: 1.05,
        ease:     'power3.out',
        scrollTrigger: { trigger: panelRef.current, start: 'top 78%' },
      })

      gsap.from(lineRef.current, {
        scaleX:          0,
        duration:        1.4,
        ease:            'power3.inOut',
        transformOrigin: isRight ? 'right center' : 'left center',
        scrollTrigger:   { trigger: panelRef.current, start: 'top 82%' },
      })
    }, panelRef)
    return () => ctx.revert()
  }, [isRight, isMobile, world.animEntry])

  // On mobile: animation stacks above text (column), full width, shorter height
  const rowDirection = isMobile ? 'column' : (isRight ? 'row-reverse' : 'row')
  const animW = isMobile ? '100%' : '480px'
  const animH = isMobile ? '300px' : '480px'

  return (
    <div
      ref={panelRef}
      style={{
        borderTop:  '1px solid var(--border)',
        background: world.bg,
        padding:    '5rem 0',
      }}
    >
      <div
        className="worlds-panel-row"
        style={{ flexDirection: rowDirection }}
      >
        {/* Text */}
        <div ref={textRef} style={{ flex: 1, minWidth: 0 }}>
          <div className="section-label" style={{ marginBottom: '1.5rem' }}>
            <span style={{ color: world.color }}>{world.label}</span>
          </div>
          <h3 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     'clamp(2rem, 3.5vw, 3rem)',
            fontWeight:   300,
            lineHeight:   1.15,
            marginBottom: '1.5rem',
          }}>
            <span style={{ color: world.color, fontStyle: 'italic' }}>
              {world.title.split(' ')[0]}
            </span>{' '}
            {world.title.split(' ').slice(1).join(' ')}
          </h3>
          <p style={{
            color:        'var(--fg-muted)',
            lineHeight:   1.88,
            marginBottom: '2rem',
            fontSize:     '1.02rem',
          }}>
            {world.body}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            {world.tags.map((t) => (
              <span key={t} style={{
                fontFamily:    'var(--font-mono)',
                fontSize:      '0.62rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding:       '0.35rem 0.8rem',
                border:        `1px solid ${world.color}33`,
                borderRadius:  '2px',
                color:         world.color,
                background:    `${world.color}0d`,
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Animation */}
        <div
          ref={animWrapRef}
          className="worlds-anim-wrap"
          style={{
            flexShrink:    0,
            width:         animW,
            height:        animH,
            position:      'relative',
            pointerEvents: 'none',
          }}
        >
          <AnimComp sectionRef={panelRef} />
        </div>
      </div>

      {/* Divider */}
      <div
        ref={lineRef}
        style={{
          height:     '1px',
          background: `linear-gradient(to ${isRight ? 'left' : 'right'}, ${world.color}44, transparent)`,
        }}
      />
    </div>
  )
}

export default function Worlds() {
  const sectionRef = useRef(null)
  const headRef    = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(headRef.current.children, {
        y: 50, opacity: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="worlds"
      ref={sectionRef}
      style={{ padding: 'var(--sp-section-y) var(--sp-section-x)', background: 'var(--bg)' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div ref={headRef}>
          <div className="section-label">My Worlds</div>
          <h2 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     'clamp(2.8rem, 5vw, 4.5rem)',
            fontWeight:   300,
            marginBottom: '1rem',
            lineHeight:   1.1,
          }}>
            The things that{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--amber)' }}>make me, me</span>
          </h2>
          <p style={{ color: 'var(--fg-muted)', marginBottom: '5rem', maxWidth: '460px', lineHeight: 1.8 }}>
            Code is only one of the languages I speak. Here are three others.
          </p>
        </div>
        {WORLDS.map((w) => <WorldPanel key={w.id} world={w} />)}
      </div>
    </section>
  )
}
