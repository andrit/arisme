/**
 * sendEmail.js — Standalone email module (EmailJS)
 * ─────────────────────────────────────────────────────────────────
 * Setup (5 minutes):
 *   1. Create a free account at https://www.emailjs.com
 *   2. Add an Email Service (Gmail, Outlook, etc.) → copy the Service ID
 *   3. Create an Email Template — use these variable names:
 *        {{from_name}}   — sender's name
 *        {{from_email}}  — sender's email
 *        {{message}}     — their message
 *   4. Account → API Keys → copy your Public Key
 *   5. Fill in CONFIG below
 *
 * EmailJS rate-limiting (free dashboard):
 *   Settings → Usage → set a daily/monthly sending limit
 *   Recommended: 20/day, 200/month for a portfolio
 *
 * Optional — Cloudflare Turnstile (invisible CAPTCHA, free):
 *   1. dash.cloudflare.com → Turnstile → Add widget → get siteKey
 *   2. Paste siteKey into CONFIG.turnstileSiteKey
 *   3. Add script to index.html:
 *        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
 *   4. In your EmailJS template, add a condition: reject if cf-turnstile-response is absent
 *      (or validate the token server-side at https://challenges.cloudflare.com/turnstile/v0/siteverify)
 * ─────────────────────────────────────────────────────────────────
 */

import emailjs from '@emailjs/browser'

// ── CONFIG — fill these in ────────────────────────────────────────
const CONFIG = {
  serviceId:        'YOUR_SERVICE_ID',    // e.g. 'service_abc123'
  templateId:       'YOUR_TEMPLATE_ID',   // e.g. 'template_xyz789'
  publicKey:        'YOUR_PUBLIC_KEY',    // e.g. 'abcDEFghiJKL123'
  toEmail:          'andy@andrewritter.me', // the address that receives messages
  turnstileSiteKey: '',                   // optional — leave empty to skip
}

/**
 * sendEmail
 *
 * Built-in spam guards (in addition to the form-level honeypot + time gate):
 *   - Rejects if honeypot field '_honey' has any value (bot filled it)
 *   - Truncates oversized fields before sending (belt-and-suspenders)
 *
 * @param {{ name: string, email: string, message: string, _honey?: string }} params
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function sendEmail({ name, email, message, _honey = '' }) {
  // Honeypot guard — if this field has a value, a bot filled it in
  if (_honey.length > 0) {
    // Silently succeed from the bot's perspective — don't reveal the guard
    return { ok: true }
  }

  // Dev mode — config not yet filled in
  if (CONFIG.serviceId.startsWith('YOUR_')) {
    console.warn(
      '[sendEmail] EmailJS not configured.\n' +
      'Open src/utils/sendEmail.js and fill in CONFIG.'
    )
    // Simulate a realistic network delay for UI testing
    return new Promise(resolve => setTimeout(() => resolve({ ok: true }), 1200))
  }

  try {
    await emailjs.send(
      CONFIG.serviceId,
      CONFIG.templateId,
      {
        from_name:  name.trim().slice(0, 100),
        from_email: email.trim().slice(0, 200),
        message:    message.trim().slice(0, 5000),
        to_email:   CONFIG.toEmail,
      },
      CONFIG.publicKey
    )
    return { ok: true }
  } catch (err) {
    console.error('[sendEmail] EmailJS error:', err)
    return {
      ok:    false,
      error: err?.text || err?.message || 'Failed to send — please try again.',
    }
  }
}
