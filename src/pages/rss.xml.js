import rss from '@astrojs/rss'
import { publishedPosts } from '../lib'

export async function GET(context) {
  const posts = await publishedPosts()
  return rss({
    title: 'Andrew Ritter — Writing',
    description: 'Essays on building software with AI at the gate, product development, and systems.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.excerpt,
      link: p.data.canonical ?? `/writing/${p.id}`,
    })),
  })
}
