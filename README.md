# Portfolio — Builder of Worlds

A modern single-page personal portfolio built with React, GSAP, and Lenis smooth scroll.

## Stack

- **React 18** — UI layer
- **GSAP 3 + ScrollTrigger** — All animations
- **Lenis** — Buttery smooth scrolling
- **Vite** — Dev server & bundler
- **Vercel** — Deployment

## Features

- 🎨 Custom cursor with lag ring
- ⚡ GSAP ScrollTrigger on every section
- 🌌 Canvas particle system with mouse interaction
- 🏔 Parallax topographic rings
- 📜 Text split-char reveals
- 🔤 Animated skill marquee
- 🖱 Smooth Lenis scroll
- 🎯 Noise overlay texture

## Local dev

```bash
npm install
npm run dev
```

## Deploy to Vercel

### Option 1 — Vercel CLI (recommended)
```bash
npm install -g vercel
vercel
```
Follow the prompts. Vercel auto-detects Vite.

### Option 2 — GitHub + Vercel Dashboard
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Framework preset: **Vite** (auto-detected)
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**

## Customize

- **`src/components/Hero.jsx`** — Headline text, tagline
- **`src/components/About.jsx`** — Bio text, stats, skills
- **`src/components/Craft.jsx`** — Replace projects with your own
- **`src/components/Worlds.jsx`** — Storytelling / systems / hiking blurbs
- **`src/components/Contact.jsx`** — Your email + social links
- **`src/index.css`** — CSS variables (colors, fonts)

## Personalize fonts
Fonts are loaded from Google Fonts in `index.html`.
Current: **Cormorant Garamond** (display) + **JetBrains Mono** (code) + **Outfit** (body)
