import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'

// Static output. Vercel serves /dist and runs the root api/ functions natively,
// so no adapter is needed.
export default defineConfig({
  site: 'https://andrewritter.me',
  output: 'static',
  integrations: [react(), sitemap()],
})
