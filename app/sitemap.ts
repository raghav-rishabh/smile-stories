import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await client.fetch(`*[_type == "post"]{ slug, _updatedAt }`)

  const blogUrls = posts.map((post: any) => ({
    url: `https://smilestoriesind.com/blog/${post.slug.current}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }))

  return [
    {
      url: 'https://smilestoriesind.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: 'https://smilestoriesind.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogUrls,
  ]
}