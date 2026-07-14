import { getCategories } from '@/lib/db/blog';
import { PostForm } from '@/components/admin/post-form';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'New Blog Post | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  const categories = await getCategories();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">New Blog Post</h1>
      <Card>
        <PostForm categories={categories} />
      </Card>
    </div>
  );
}
