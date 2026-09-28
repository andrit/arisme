import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

// Writing — one markdown file per post; the filename is the URL slug.
const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    title:     z.string(),
    date:      z.coerce.date(),
    excerpt:   z.string(),
    tags:      z.array(z.string()).default([]),
    // Set when the canonical text lives on another page of this site (e.g. /the-turn)
    canonical: z.string().optional(),
    draft:     z.boolean().default(false),
  }),
})

// Work — one directory per project; index.md is the card + editorial summary.
const work = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/work',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: z.object({
    title:   z.string(),
    tagline: z.string(),
    role:    z.string(),
    period:  z.string(),
    status:  z.string(),
    stack:   z.array(z.string()).default([]),
    links:   z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    order:   z.number().default(100),
    // Study versioning: snapshots live in _versions/vN-date/ (scripts/version-study.sh)
    version: z.number().optional(),
    updated: z.coerce.date().optional(),
    draft:   z.boolean().default(false),
  }),
})

// Studies — the product-development documents that sit under a work entry
// (prd.md, decisions.md, timeline.md, …). id = "<project>/<doc>".
const studies = defineCollection({
  loader: glob({
    pattern: ['*/*.md', '!*/index.md'],
    base: './src/content/work',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    order: z.number().default(100),
  }),
})

export const collections = { posts, work, studies }
