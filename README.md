# Portfolio — Andy Rewriter

A single-page personal portfolio built with React, GSAP, Three.js, D3.js, and Lenis.

## Stack

| Package | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | 18.3.1 | UI layer |
| `gsap` | 3.12.5 | Animations + ScrollTrigger |
| `lenis` | 1.1.13 | Smooth scroll |
| `three` | 0.165.0 | 3D animations (Worlds section) |
| `simplex-noise` | 4.0.1 | Mountain terrain generation |
| `d3` | 7.9.0 | Skills mindmap force graph |
| `@emailjs/browser` | 4.4.1 | Contact form email delivery |
| `vite` | 5.4.2 | Build tool |

## Local development

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel
# Follow prompts — framework auto-detected as Vite
```

### Option B — GitHub + Vercel Dashboard
1. Push repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. Vercel auto-detects Vite. Settings will be:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Install command**: `npm install`
4. Click **Deploy**

## Before going live — checklist

### 1. Contact form (Resend)
The contact form sends via a Vercel serverless function (`api/send.js`) using Resend.

1. Create a free account at https://resend.com (3,000 emails/month free)
2. Add your sending domain OR use the Resend sandbox domain (resend.dev)
3. Copy your API key
4. In Vercel dashboard → Settings → Environment Variables, add:
   - `RESEND_API_KEY` = `re_xxxxxxxxxxxx`
   - `CONTACT_TO_EMAIL` = `andy@andrewritter.me`
   - `CONTACT_FROM` = `Portfolio <noreply@yourdomain.com>`

### 2. Social links
Open `src/components/Contact.jsx` and update the `href` values:
```js
const LINKS = [
  { label: 'GitHub',   href: 'https://github.com/YOUR_USERNAME', ... },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/YOUR_USERNAME', ... },
]
```

### 3. Personal details
- `src/components/Navbar.jsx` — logo text
- `src/components/Hero.jsx` — headline, subline, tags
- `src/components/About.jsx` — bio copy, stats
- `src/data/mindmap.js` — skills and experience weights
- `public/favicon.svg` — favicon

## Personalisation

### Mindmap skills (`src/data/mindmap.js`)
- Add/edit entries in `NODES` — each needs `id`, `label`, `domain`, `group`, `weight` (1–5)
- Adjust visual config in `GRAPH_CONFIG` — colours, forces, zoom limits
- Add cross-discipline connections in `CROSS_LINKS` for phase 3

### Worlds section (`src/components/Worlds.jsx`)
- Edit the `WORLDS` array — body copy, tags, colours per domain

### Stats banner (`src/components/About.jsx`)
- Edit `ALL_STATS` — the 12 stats rotate across 4 visible slots every 4.5 seconds
