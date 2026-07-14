import { notFound } from 'next/navigation';
import { getPostById, getCategories } from '@/lib/db/blog';
import { PostForm } from '@/components/admin/post-form';
import { Card } from '@/components/ui/card';

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Blog Post | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getPostById(id), getCategories()]);
  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Edit Blog Post</h1>
      <Card>
        <PostForm post={post} categories={categories} />
      </Card>
    </div>
  );
}
