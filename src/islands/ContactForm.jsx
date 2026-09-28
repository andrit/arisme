import { useRef, useState } from 'react'

// Client-side checks mirror api/send.js — the server is the real gate.
function validate({ name, email, message }) {
  if (!name.trim() || !email.trim() || !message.trim()) return 'Please fill in all fields.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       return 'Please enter a valid email address.'
  if (message.trim().length < 10)                        return 'Your message is a bit short.'
  if (message.trim().length > 4000)                      return 'Message is too long (4,000 chars max).'
  if ((message.match(/https?:\/\//gi) || []).length > 2) return 'Too many links in your message.'
  return null
}

async function sendEmail(payload) {
  try {
    const res  = await fetch('/api/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.ok) return { ok: true }
    return { ok: false, error: data.error || 'Something went wrong — please try again.' }
  } catch {
    return { ok: false, error: 'Network error — please check your connection.' }
  }
}

export default function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '', _honey: '' })
  const [status, setStatus] = useState('idle')   // idle | sending | sent
  const [error, setError]   = useState(null)
  const openedAt = useRef(Date.now())

  const onChange = (e) => setFields((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    const v = validate(fields)
    if (v) { setError(v); return }
    if (Date.now() - openedAt.current < 3000) { setError('Please take a moment to fill in the form.'); return }
    setStatus('sending')
    const r = await sendEmail({ ...fields, submitted_at: openedAt.current })
    if (r.ok) { setStatus('sent') } else { setStatus('idle'); setError(r.error) }
  }

  if (status === 'sent') {
    return (
      <div>
        <h3>Message sent<span className="accent">.</span></h3>
        <p className="lede" style={{ margin: '1rem 0 2rem' }}>Thanks for reaching out — I'll be in touch soon.</p>
        <button className="btn" type="button" onClick={() => { setFields({ name: '', email: '', message: '', _honey: '' }); setStatus('idle') }}>
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: 'grid', gap: '1.5rem' }}>
      {/* Honeypot — hidden from humans, filled by bots */}
      <input name="_honey" value={fields._honey} onChange={onChange} tabIndex={-1} autoComplete="off" aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />

      <div className="field">
        <label htmlFor="cf-name">Your name</label>
        <input id="cf-name" name="name" value={fields.name} onChange={onChange} required autoComplete="name" />
      </div>
      <div className="field">
        <label htmlFor="cf-email">Your email</label>
        <input id="cf-email" name="email" type="email" value={fields.email} onChange={onChange} required autoComplete="email" />
      </div>
      <div className="field">
        <label htmlFor="cf-message">Your message</label>
        <textarea id="cf-message" name="message" rows={5} value={fields.message} onChange={onChange} required />
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div>
        <button className="btn" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  )
}
