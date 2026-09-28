/**
 * api/feed.js — Vercel Serverless Function
 * Fetches the Medium and Substack RSS feeds server-side (the browser can't:
 * CORS), normalises them to one shape, merges newest-first, and caches at the
 * edge for an hour.
 *
 * Environment variables (Vercel dashboard → Settings → Environment Variables):
 *   MEDIUM_FEED_URL   = https://medium.com/feed/@<handle>
 *   SUBSTACK_FEED_URL = https://<publication>.substack.com/feed
 * Either may be unset — that source is simply skipped.
 */

import { parseRss, mergeByDate } from '../lib/rss.js'

const SOURCES = [
  { source: 'medium',   url: process.env.MEDIUM_FEED_URL },
  { source: 'substack', url: process.env.SUBSTACK_FEED_URL },
]

async function fetchSource({ source, url }) {
  if (!url) return { source, items: [], skipped: 'unset' }
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'andrewritter.me feed merge' }, signal: AbortSignal.timeout(6000) })
    if (!res.ok) return { source, items: [], error: `HTTP ${res.status}` }
    const xml = await res.text()
    return { source, items: parseRss(xml, source) }
  } catch (err) {
    return { source, items: [], error: err?.message || String(err) }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const results = await Promise.all(SOURCES.map(fetchSource))
  const items   = mergeByDate(...results.map((r) => r.items))
  // Surface per-source failures so an empty list is distinguishable from "nothing published".
  const sources = Object.fromEntries(results.map((r) => [r.source, r.error ? { error: r.error } : r.skipped ? { skipped: r.skipped } : { count: r.items.length }]))

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json({ items, sources })
}
