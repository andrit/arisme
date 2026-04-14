import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { prefersReducedMotion } from '../utils/motion'
import { sendEmail } from '../utils/sendEmail'

gsap.registerPlugin(ScrollTrigger)

const LINKS = [
  { label: 'GitHub',   href: 'https://github.com/andrit',       fa: 'fa-brands fa-github'   },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/andrewritterdeveloper',  fa: 'fa-brands fa-linkedin' },
]

// ─────────────────────────────────────────────────────────────────
// Spam helpers
// ─────────────────────────────────────────────────────────────────
function useTimeGate(ms = 3000) {
  const t = useRef(Date.now())
  return () => Date.now() - t.current >= ms
}

function validate({ name, email, message }) {
  if (!name.trim() || !email.trim() || !message.trim()) return 'Please fill in all fields.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       return 'Please enter a valid email address.'
  if (message.trim().length < 10)                        return 'Your message is a bit short.'
  if (message.trim().length > 5000)                      return 'Message is too long (5000 chars max).'
  if ((message.match(/https?:\/\//gi) || []).length > 2) return 'Too many links in your message.'
  return null
}

// ─────────────────────────────────────────────────────────────────
// Floating-label input
// ─────────────────────────────────────────────────────────────────
function Field({ label, type = 'text', name, value, onChange, required, multiline }) {
  const [focused, setFocused] = useState(false)
  const float = focused || value.length > 0
  const borderColor = focused ? 'rgba(196,154,82,0.6)' : value.length > 0 ? 'rgba(240,234,216,0.14)' : 'rgba(240,234,216,0.06)'
  const base = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `1px solid ${borderColor}`, color: 'var(--fg)',
    fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 300,
    padding: '0.75rem 0', outline: 'none', resize: 'none',
    transition: 'border-color 0.3s', caretColor: 'var(--amber)', display: 'block',
  }
  return (
    <div style={{ position: 'relative', paddingTop: '1.4rem' }}>
      <label style={{
        position: 'absolute', top: float ? '0' : '2.15rem', left: 0,
        fontFamily: 'var(--font-mono)', fontSize: float ? '0.6rem' : '0.85rem',
        letterSpacing: float ? '0.15em' : '0.05em', textTransform: 'uppercase',
        color: focused ? 'var(--amber)' : 'var(--fg-muted)',
        transition: 'all 0.25s var(--ease-out-expo)', pointerEvents: 'none', userSelect: 'none',
      }}>{label}</label>
      {multiline
        ? <textarea name={name} value={value} required={required} rows={4}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={onChange} style={{ ...base, lineHeight: 1.7 }} />
        : <input type={type} name={name} value={value} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={onChange} style={base} />
      }
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// VIEW 1 — Static: paragraph + email link
// Mounts fresh → animates in → click link to go to 'form'
// ─────────────────────────────────────────────────────────────────
function StaticView({ onOpen }) {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    gsap.from(ref.current.children, {
      y: 16, opacity: 0, duration: 0.5, stagger: 0.12,
      ease: 'power3.out', clearProps: 'transform,opacity',
    })
  }, [])

  return (
    <div ref={ref}>
      <p style={{
        color: 'var(--fg-muted)', fontSize: '1.1rem',
        lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '420px',
      }}>
        Whether you have a project in mind, want to explore a wild idea together,
        or just want to swap hiking trail recommendations — I'm all ears.
      </p>
      <a
        href="mailto:andy@andrewritter.me"
        onClick={onOpen}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
          fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300,
          color: 'var(--fg)', borderBottom: '1px solid var(--fg-dim)',
          paddingBottom: '0.3rem', transition: 'all 0.3s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--amber)'; e.currentTarget.style.borderColor = 'var(--amber)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg)';    e.currentTarget.style.borderColor = 'var(--fg-dim)' }}
      >
        Send me an email <span style={{ fontSize: '1rem' }}>↗</span>
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// VIEW 2 — Form: name, email, message, send / cancel
// Mounts fresh → staggers in → submit → 'sent' | cancel → 'static'
// ─────────────────────────────────────────────────────────────────
function FormView({ onCancel, onSent }) {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending'
  const [error,  setError]  = useState('')
  const isReadyToSubmit     = useTimeGate(3000)
  const itemsRef            = useRef([])
  const setItem             = (el, i) => { if (el) itemsRef.current[i] = el }

  useEffect(() => {
    if (prefersReducedMotion()) return
    gsap.from(itemsRef.current.filter(Boolean), {
      y: 22, opacity: 0, duration: 0.55, stagger: 0.09,
      ease: 'back.out(1.4)', clearProps: 'transform,opacity',
    })
  }, [])

  const handleChange = e => setFields(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!isReadyToSubmit()) { setError('Please take a moment to fill in the form.'); return }
    const err = validate(fields)
    if (err) { setError(err); return }
    setError('')
    setStatus('sending')
    const result = await sendEmail(fields)
    if (result.ok) {
      onSent()
    } else {
      setStatus('idle')
      setError(result.error || 'Something went wrong — please try again.')
    }
  }

  const btnBase = {
    all: 'unset', cursor: 'none', display: 'inline-flex', alignItems: 'center',
    gap: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    padding: '0.85rem 1.6rem', border: '1px solid var(--border-hover)',
    borderRadius: '2px', transition: 'all 0.3s',
  }
  const sending = status === 'sending'

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot — invisible to humans, bots fill it */}
      <input name="_honey" tabIndex={-1} aria-hidden="true" onChange={() => {}}
        style={{ position: 'absolute', opacity: 0, height: 0, width: 0, pointerEvents: 'none' }} />

      <div ref={el => setItem(el, 0)} style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 300, lineHeight: 1.2,
          fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
        }}>
          Let's Chat<span style={{ color: 'var(--amber)' }}>.</span>
        </h3>
      </div>

      <div ref={el => setItem(el, 1)} style={{ marginBottom: '1.8rem' }}>
        <Field label="Your name"    name="name"    value={fields.name}    onChange={handleChange} required />
      </div>
      <div ref={el => setItem(el, 2)} style={{ marginBottom: '1.8rem' }}>
        <Field label="Your email"   name="email"   value={fields.email}   onChange={handleChange} required type="email" />
      </div>
      <div ref={el => setItem(el, 3)} style={{ marginBottom: '2rem' }}>
        <Field label="Your message" name="message" value={fields.message} onChange={handleChange} required multiline />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', color: '#c9562e', marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <div ref={el => setItem(el, 4)} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" disabled={sending}
          style={{
            ...btnBase,
            color:       sending ? 'var(--fg-muted)' : 'var(--fg)',
            borderColor: sending ? 'var(--border)'   : 'var(--green)',
            background:  sending ? 'transparent'     : 'rgba(92,143,106,0.06)',
          }}
          onMouseEnter={e => { if (!sending) { e.currentTarget.style.background = 'rgba(92,143,106,0.14)'; e.currentTarget.style.color = 'var(--green-light)' }}}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(92,143,106,0.06)'; e.currentTarget.style.color = 'var(--fg)' }}
        >
          {sending ? '◌ Sending…' : 'Send it →'}
        </button>

        <button type="button" onClick={onCancel} disabled={sending}
          style={{ ...btnBase, color: 'var(--fg-dim)', border: 'none', padding: '0.85rem 0' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--fg-muted)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-dim)'}
        >
          ← Cancel
        </button>
      </div>
    </form>
  )
}

// ─────────────────────────────────────────────────────────────────
// VIEW 3 — Sent: confirmation message
// Mounts fresh → animates in → "send another" → 'static'
// ─────────────────────────────────────────────────────────────────
function SentView({ onReset }) {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    gsap.from(ref.current.children, {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1,
      ease: 'power3.out', clearProps: 'transform,opacity',
    })
  }, [])

  const btnBase = {
    all: 'unset', cursor: 'none', display: 'inline-flex', alignItems: 'center',
    gap: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    letterSpacing: '0.15em', textTransform: 'uppercase',
    padding: '0.85rem 1.6rem', border: '1px solid var(--border-hover)',
    borderRadius: '2px', transition: 'all 0.3s',
  }

  return (
    <div ref={ref}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 300, lineHeight: 1.2,
        fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', marginBottom: '1rem',
      }}>
        Message sent<span style={{ color: 'var(--amber)' }}>.</span>
      </h3>
      <p style={{ color: 'var(--fg-muted)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '420px' }}>
        Thanks for reaching out — I'll be in touch soon.
      </p>
      <button onClick={onReset}
        style={{ ...btnBase, color: 'var(--fg-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--fg)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
      >
        ← Send another
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ContactLeft — state machine, one view at a time
// ─────────────────────────────────────────────────────────────────
function ContactLeft() {
  const [view, setView] = useState('static') // 'static' | 'form' | 'sent'

  const openForm  = e => { e.preventDefault(); setView('form')   }
  const closeForm = ()  => setView('static')
  const goSent    = ()  => setView('sent')
  const reset     = ()  => setView('static')

  return (
    <div>
      {view === 'static' && <StaticView onOpen={openForm} />}
      {view === 'form'   && <FormView   onCancel={closeForm} onSent={goSent} />}
      {view === 'sent'   && <SentView   onReset={reset} />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main Contact section
// ─────────────────────────────────────────────────────────────────
export default function Contact() {
  const sectionRef = useRef(null)
  const bigRef     = useRef(null)
  const bodyRef    = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from(bigRef.current.querySelectorAll('.big-char'), {
        y: 80, opacity: 0, duration: 1.0, stagger: 0.04, ease: 'power4.out',
        scrollTrigger: { trigger: bigRef.current, start: 'top 85%' },
      })
      gsap.from(bodyRef.current.children, {
        y: 40, opacity: 0, duration: 0.85, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: bodyRef.current, start: 'top 85%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const greeting = "Let's build something."
  const chars = greeting.split('').map((c, i) => (
    <span key={i} className="big-char" style={{ display: 'inline-block', color: c === '.' ? 'var(--amber)' : 'inherit' }}>
      {c === ' ' ? '\u00A0' : c}
    </span>
  ))

  return (
    <section id="contact" ref={sectionRef} style={{
      padding: 'var(--sp-section-y) var(--sp-section-x) 6rem',
      background: 'var(--bg-1)', borderTop: '1px solid var(--border)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:'600px', height:'600px', borderRadius:'50%', border:'1px solid rgba(92,143,106,0.06)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-30%', right:'-15%', width:'800px', height:'800px', borderRadius:'50%', border:'1px solid rgba(92,143,106,0.04)', pointerEvents:'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative' }}>
        <div className="section-label">Contact</div>

        <div ref={bigRef} style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(3rem,7vw,6.5rem)',
          fontWeight: 300, lineHeight: 1.05, marginBottom: '4rem', overflow: 'hidden',
        }}>
          {chars}
        </div>

        <div ref={bodyRef} className="contact-grid">
          <ContactLeft />

          <div>
            <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.68rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--fg-muted)', marginBottom:'1.5rem' }}>
              Find me elsewhere
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {LINKS.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.2rem', border:'1px solid var(--border)', borderRadius:'3px', color:'var(--fg-muted)', transition:'all 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(92,143,106,0.4)'; e.currentTarget.style.color='var(--fg)'; e.currentTarget.style.paddingLeft='1.6rem' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--fg-muted)'; e.currentTarget.style.paddingLeft='1.2rem' }}
                >
                  <i className={l.fa} style={{ color:'var(--green)', fontSize:'1rem', width:'16px', textAlign:'center' }} />
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.95rem' }}>{l.label}</span>
                  <span style={{ marginLeft:'auto', fontSize:'0.75rem', opacity:0.4 }}>↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop:'8rem', paddingTop:'2rem', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--fg-muted)' }}>
            <span style={{ color:'var(--amber)' }}>◈</span> Dev / Wanderer
          </span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.12em', color:'var(--fg-dim)' }}>MMXXVI — Built with intent</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.65rem', letterSpacing:'0.1em',  color:'var(--fg-dim)' }}>React + GSAP + Vite</span>
        </div>
      </div>
    </section>
  )
}
