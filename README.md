# andrewritter.me

Personal site — product development & engineering, writing, and the case studies behind the products. Built with [Astro](https://astro.build) (static output) with React islands where a page needs interaction. Deployed on Vercel.

The previous site (React/GSAP/Three.js single-page portfolio) is archived at git tag `archive/react-site` and in `archive/arisme-react-site-2026-09-17.tar.gz`.

## Stack

| Package | Purpose |
|---|---|
| `astro` | Static site, routing, content collections, markdown |
| `@astrojs/react` + `react` | Islands: contact form, syndicated-posts list |
| `@astrojs/rss` | `/rss.xml` — the feed Medium/Substack imports read |
| `@astrojs/sitemap` | `/sitemap-index.xml` |
| `resend` | Contact-form email, server-side in `api/send.js` |

Requires **Node ≥ 22.12** (Astro 7).

## Local development

```bash
npm install
npm run dev        # → http://localhost:4321
npm run build      # → dist/
npm run check      # type-check .astro/.ts
```

`astro dev` does not run the Vercel functions in `api/`, so the contact form and the Medium/Substack list are inert locally. Use `vercel dev` if you need them.

## Content

| What | Where | Notes |
|---|---|---|
| Writing | `src/content/posts/<slug>.md` | Frontmatter: `title, date, excerpt, tags, canonical?, draft?`. Filename = URL slug. |
| Work (case studies) | `src/content/work/<project>/index.md` | Card + editorial summary. Frontmatter: `title, tagline, role, period, status, stack, links, order, draft?` |
| Study documents | `src/content/work/<project>/<doc>.md` | e.g. `prd.md`, `decisions.md`, `timeline.md`. Frontmatter: `title, order`. Rendered as sections under the project page. |
| The Turn | `src/content/pages/the-turn.md` | Long-form page at `/the-turn`. |

Entries with `draft: true` show in `astro dev` and are excluded from the production build.

## Syndication

The site is canonical. Each post is also published outward by hand:

- **Medium** — *Import a story* with the post's URL (sets the canonical link back here). Medium closed its API to new integrations in Jan 2025, so there is no automated path.
- **Substack** — paste into the editor. Substack has no publishing API.

The reverse direction is automatic: `api/feed.js` reads both RSS feeds and `/writing` lists those posts with a link out.

## Vercel environment variables

| Variable | Used by |
|---|---|
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM` | `api/send.js` |
| `MEDIUM_FEED_URL` (`https://medium.com/feed/@<handle>`) | `api/feed.js` — optional |
| `SUBSTACK_FEED_URL` (`https://<pub>.substack.com/feed`) | `api/feed.js` — optional |

## Layout

```
api/            Vercel serverless functions (send, feed)
lib/            pure helpers shared by api/ (rss parser)
public/         static assets
src/
  content/      markdown collections (posts, work, pages)
  content.config.ts
  layouts/      Base.astro — head, header, footer
  components/   static Astro sections and cards
  islands/      React components hydrated on the client
  pages/        routes
  styles/       global.css — tokens, reset, prose
```
