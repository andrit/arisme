/**
 * sendEmail.js — posts to the Vercel serverless function at /api/send
 *
 * The actual sending logic, rate-limiting, and sanitisation all live
 * server-side in api/send.js. This module is just the browser-side
 * fetch wrapper.
 *
 * Environment variable needed in Vercel dashboard:
 *   RESEND_API_KEY   =  re_xxxxxxxxxxxx  (from resend.com)
 *   CONTACT_TO_EMAIL =  andy@andrewritter.me
 *   CONTACT_FROM     =  Portfolio <noreply@yourdomain.com>
 */

/**
 * @param {{ name: string, email: string, message: string, _honey?: string }} params
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function sendEmail({ name, email, message, _honey = '' }) {
  try {
    const res = await fetch('/api/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        message,
        _honey,
        // Timestamp sent from browser — server uses this for the time gate check
        submitted_at: Date.now(),
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (res.ok && data.ok) return { ok: true }

    return {
      ok:    false,
      error: data.error || 'Something went wrong — please try again.',
    }

  } catch (err) {
    console.error('[sendEmail] Network error:', err)
    return { ok: false, error: 'Network error — please check your connection.' }
  }
}
