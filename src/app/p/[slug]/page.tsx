import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPageBySlug } from '@/lib/db/pages';
import { MarkdownRenderer } from '@/components/ui/markdown';
import { Card } from '@/components/ui/card';
import { getBaseUrl } from '@/lib/utils/site-url';
import { markdownToPlainText } from '@/lib/utils/markdown-to-plain-text';

interface StaticPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: 'Not Found' };
  const description = markdownToPlainText(page.content || '').slice(0, 160);
  const canonical = `${getBaseUrl()}/p/${page.slug}`;
  return {
    title: `${page.title} | GoToWorship`,
    description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description,
    },
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Card className="border-t-4 border-t-primary-500 p-8 md:p-12">
        <h1 className="mb-8 text-4xl font-extrabold text-slate-900">{page.title}</h1>
        <div className="prose max-w-none">
          <MarkdownRenderer content={page.content || ''} />
        </div>
      </Card>
    </div>
  );
}
