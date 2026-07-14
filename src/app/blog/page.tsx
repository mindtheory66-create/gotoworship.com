import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/db/blog';
import { Card } from '@/components/ui/card';
import { getBaseUrl } from '@/lib/utils/site-url';

const siteUrl = getBaseUrl();
import { Calendar, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog | GoToWorship',
  description: 'Articles, guides, and community news about places of worship in the United States.',
  alternates: { canonical: `${siteUrl}/blog` },
  openGraph: {
    title: 'Blog | GoToWorship',
    description: 'Articles, guides, and community news about places of worship in the United States.',
    url: `${siteUrl}/blog`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | GoToWorship',
    description: 'Articles, guides, and community news about places of worship in the United States.',
  },
};
export const revalidate = 86400;

export default async function BlogIndexPage() {
  const posts = await getPublishedPosts(50);

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">Articles, guides, and community news</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post: any) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="group h-full overflow-hidden p-0 transition-colors hover:border-primary-300">
              {post.featured_image && (
                <div className="h-52 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="mb-3 flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.published_at && new Date(post.published_at).toLocaleDateString()}
                  </span>
                  {post.category && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-primary-700">{post.category.name}</span>}
                </div>
                <h2 className="mb-2 text-xl font-bold text-slate-900 group-hover:text-primary-600">{post.title}</h2>
                {post.excerpt && <p className="mb-4 line-clamp-3 text-slate-500">{post.excerpt}</p>}
                <span className="inline-flex items-center text-sm font-semibold text-primary-600">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {posts.length === 0 && <p className="text-center text-slate-600">No articles yet.</p>}
    </div>
  );
}
