import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/db/blog';
import { MarkdownRenderer } from '@/components/ui/markdown';
import { getBaseUrl } from '@/lib/utils/site-url';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };
  const description = post.excerpt || (post.content ? post.content.replace(/[#*\[\]`]/g, '').slice(0, 160) : '');
  const canonical = `${getBaseUrl()}/blog/${post.slug}`;
  return {
    title: `${post.title} | GoToWorship Blog`,
    description,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.featured_image ? [post.featured_image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="mb-6 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary-600">
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to Blog
      </Link>
      {post.featured_image && (
        <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
          <img src={post.featured_image} alt={post.title} className="h-80 w-full object-cover" />
        </div>
      )}
      <h1 className="mb-4 text-4xl font-extrabold text-slate-900">{post.title}</h1>
      <div className="mb-8 flex items-center gap-4 text-sm font-semibold text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {post.published_at && new Date(post.published_at).toLocaleDateString()}
        </span>
        {(post as any).category && <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-700">{(post as any).category.name}</span>}
      </div>
      {post.excerpt && <p className="mb-8 rounded-2xl border-l-4 border-primary-500 bg-primary-50 p-6 text-lg font-medium italic text-primary-900">{post.excerpt}</p>}
      <div className="prose max-w-none">
        <MarkdownRenderer content={post.content || ''} />
      </div>
    </article>
  );
}
