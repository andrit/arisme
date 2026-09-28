import { getCollection } from 'astro:content'

// Drafts are visible in `astro dev` and hidden from the production build.
const showDrafts = import.meta.env.DEV

export async function publishedPosts() {
  const posts = await getCollection('posts', ({ data }) => showDrafts || !data.draft)
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function publishedWork() {
  const work = await getCollection('work', ({ data }) => showDrafts || !data.draft)
  return work.sort((a, b) => a.data.order - b.data.order)
}
