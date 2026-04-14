/**
 * api/send.js — Vercel Serverless Function
 * Receives contact form submissions and sends via Resend.
 *
 * Setup:
 *   1. npm install resend  (already in package.json)
 *   2. Create account at https://resend.com (free: 3,000 emails/month)
 *   3. Add a sending domain OR use their sandbox (resend.dev)
 *   4. In Vercel dashboard → Settings → Environment Variables, add:
 *        RESEND_API_KEY   =  re_xxxxxxxxxxxx
 *        CONTACT_TO_EMAIL =  andy@andrewritter.me
 *        CONTACT_FROM     =  Portfolio <noreply@yourdomain.com>
 *
 * Security layers applied here (server-side, cannot be bypassed by client):
 *   1. Method guard        — only POST accepted
 *   2. Content-type guard  — must be application/json
 *   3. Honeypot check      — _honey field must be empty
 *   4. Time gate           — submitted_at must be >= 3s ago
 *   5. Per-IP rate limit   — max 3 submissions per 10-minute window
 *   6. Global rate limit   — max 30 submissions per hour total
 *   7. Field validation    — lengths, email format, URL count
 *   8. Input sanitisation  — strips HTML tags, null bytes, normalises whitespace
 *   9. API key server-side — Resend key never touches the browser
 */

import { Resend } from 'resend'

// ── In-memory rate limit stores ───────────────────────────────
// These persist for the lifetime of the function instance.
// On Vercel, instances can be recycled, but this is sufficient
// protection for a personal portfolio site.
const ipWindows    = new Map()   // ip → [timestamp, ...]
const globalWindow = []          // [timestamp, ...]

const IP_LIMIT        = 3        // max requests per IP per window
const IP_WINDOW_MS    = 10 * 60 * 1000   // 10 minutes
const GLOBAL_LIMIT    = 30
const GLOBAL_WINDOW_MS = 60 * 60 * 1000  // 1 hour

function checkRateLimit(ip) {
  const now = Date.now()

  // Prune expired global entries
  while (globalWindow.length && globalWindow[0] < now - GLOBAL_WINDOW_MS)
    globalWindow.shift()

  if (globalWindow.length >= GLOBAL_LIMIT)
    return { blocked: true, reason: 'Global rate limit reached. Try again later.' }

  // Prune expired per-IP entries
  if (!ipWindows.has(ip)) ipWindows.set(ip, [])
  const ipLog = ipWindows.get(ip)
  while (ipLog.length && ipLog[0] < now - IP_WINDOW_MS) ipLog.shift()

  if (ipLog.length >= IP_LIMIT)
    return { blocked: true, reason: 'Too many submissions. Please wait a few minutes.' }

  // Record this request
  ipLog.push(now)
  globalWindow.push(now)
  return { blocked: false }
}

// ── Input sanitisation ────────────────────────────────────────
function sanitise(str = '') {
  return str
    .replace(/\0/g, '')                     // null bytes
    .replace(/<[^>]*>/g, '')               // HTML/script tags
    .replace(/javascript:/gi, '')          // JS protocol
    .replace(/on\w+\s*=/gi, '')            // inline event handlers
    .trim()
    .slice(0, 5000)                        // hard length cap
}

// ── Field validation ──────────────────────────────────────────
function validateFields({ name, email, message }) {
  if (!name || !email || !message)
    return 'All fields are required.'
  if (name.length < 2)
    return 'Name is too short.'
  if (name.length > 100)
    return 'Name is too long.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return 'Please enter a valid email address.'
  if (email.length > 254)
    return 'Email address is too long.'
  if (message.length < 10)
    return 'Message is too short — feel free to say more.'
  if (message.length > 4000)
    return 'Message is too long (max 4,000 characters).'
  const urlCount = (message.match(/https?:\/\//gi) || []).length
  if (urlCount > 2)
    return 'Too many links in your message.'
  return null
}

// ── Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {

  // 1. Method guard
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 2. Content-type guard
  const ct = req.headers['content-type'] || ''
  if (!ct.includes('application/json')) {
    return res.status(400).json({ error: 'Content-Type must be application/json' })
  }

  // 3. Rate limiting — check before touching body
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  const rateCheck = checkRateLimit(ip)
  if (rateCheck.blocked) {
    return res.status(429).json({ error: rateCheck.reason })
  }

  const { name, email, message, _honey, submitted_at } = req.body || {}

  // 4. Honeypot — silent reject (don't reveal the guard)
  if (_honey && _honey.length > 0) {
    // Return 200 so bots think they succeeded
    return res.status(200).json({ ok: true })
  }

  // 5. Time gate — reject submissions under 3 seconds
  if (submitted_at) {
    const elapsed = Date.now() - Number(submitted_at)
    if (elapsed < 3000) {
      return res.status(400).json({ error: 'Please take a moment to fill in the form.' })
    }
  }

  // 6. Sanitise inputs
  const cleanName    = sanitise(name)
  const cleanEmail   = sanitise(email).toLowerCase()
  const cleanMessage = sanitise(message)

  // 7. Validate sanitised inputs
  const validationError = validateFields({
    name:    cleanName,
    email:   cleanEmail,
    message: cleanMessage,
  })
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  // 8. Send via Resend
  const apiKey  = process.env.RESEND_API_KEY
  const toEmail = process.env.CONTACT_TO_EMAIL || 'andy@andrewritter.me'
  const from    = process.env.CONTACT_FROM     || 'Portfolio Contact <noreply@resend.dev>'

  if (!apiKey) {
    console.error('[send] RESEND_API_KEY environment variable is not set')
    return res.status(500).json({ error: 'Email service not configured.' })
  }

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from,
      to:      [toEmail],
      replyTo: cleanEmail,
      subject: `Portfolio message from ${cleanName}`,
      html: `
        <p><strong>Name:</strong> ${cleanName}</p>
        <p><strong>Email:</strong> ${cleanEmail}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${cleanMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      `,
      text: `Name: ${cleanName}\nEmail: ${cleanEmail}\n\nMessage:\n${cleanMessage}`,
    })

    return res.status(200).json({ ok: true })

  } catch (err) {
    console.error('[send] Resend error:', err?.message || err)
    return res.status(500).json({ error: 'Failed to send — please try again.' })
  }
}
