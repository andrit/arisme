import { useEffect, useState } from 'react'

// Lists posts syndicated on Medium / Substack, fetched from /api/feed.
// Renders nothing until data arrives and nothing at all if the feed is
// unavailable (e.g. `astro dev`, where Vercel functions don't run).
export default function RemotePosts({ limit = 10, heading = true }) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/feed')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`feed ${r.status}`))))
      .then((data) => { if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []) })
      .catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [])

  if (!items || items.length === 0) return null

  const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const label = { medium: 'Medium', substack: 'Substack' }

  return (
    <div style={{ marginTop: heading ? '3rem' : 0 }}>
      {heading && <p className="mono" style={{ marginBottom: '1rem' }}>Elsewhere</p>}
      <div className="list">
        {items.slice(0, limit).map((p) => (
          <a key={p.url} className="card post-card" href={p.url} target="_blank" rel="noopener noreferrer">
            <div className="meta">
              <time className="mono" dateTime={p.date}>{fmt(p.date)}</time>
              <span className="mono">{label[p.source] ?? p.source} ↗</span>
            </div>
            <h3 style={{ fontSize: 'clamp(1.4rem, 2.2vw, 1.8rem)' }}>{p.title}</h3>
            {p.excerpt && <p>{p.excerpt}</p>}
          </a>
        ))}
      </div>
    </div>
  )
}
