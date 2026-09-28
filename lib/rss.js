/**
 * lib/rss.js — pure RSS 2.0 parsing, no I/O. Used by api/feed.js.
 *
 * Deliberately regex-based: Medium and Substack both emit plain RSS 2.0 with
 * CDATA-wrapped titles and descriptions, and pulling in an XML parser for two
 * feeds is more surface than it is worth.
 * ponytail: regex parse fine for RSS 2.0 from these two sources. ceiling: Atom
 * feeds or namespaced content. upgrade: fast-xml-parser when a third source lands.
 */

const ITEM_RE = /<item\b[^>]*>([\s\S]*?)<\/item>/gi

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))
  return m ? m[1].trim() : ''
}

function unwrap(s) {
  return s.replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/, '$1').trim()
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
}

function stripHtml(s) {
  return decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

export function excerptOf(html, max = 220) {
  const text = stripHtml(unwrap(html))
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

/**
 * @param {string} xml   raw RSS 2.0 document
 * @param {'medium'|'substack'} source
 * @returns {{ title: string, url: string, date: string, source: string, excerpt: string }[]}
 */
export function parseRss(xml, source) {
  const items = []
  for (const m of xml.matchAll(ITEM_RE)) {
    const block = m[1]
    const title = decodeEntities(unwrap(tag(block, 'title')))
    const url   = unwrap(tag(block, 'link')) || unwrap(tag(block, 'guid'))
    const pub   = unwrap(tag(block, 'pubDate'))
    const date  = pub ? new Date(pub) : null
    if (!title || !url || !date || Number.isNaN(date.getTime())) continue
    const body = tag(block, 'content:encoded') || tag(block, 'description')
    items.push({ title, url, date: date.toISOString(), source, excerpt: excerptOf(body) })
  }
  return items
}

/** Merge several parsed lists, newest first. */
export function mergeByDate(...lists) {
  return lists.flat().sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
