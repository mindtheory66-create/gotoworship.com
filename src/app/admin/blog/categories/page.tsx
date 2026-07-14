import Link from 'next/link';
import { getCategories } from '@/lib/db/blog';
import { CategoryForm } from '@/components/admin/category-form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeleteButton } from '@/components/admin/delete-button';
import { deleteCategory } from '@/lib/admin/blog-actions';

export const metadata = {
  title: 'Blog Categories | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Categories</h1>
        <Link href="/admin/blog/posts">
          <Button variant="outline">Back to Posts</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Add / Edit Category</h2>
        <CategoryForm />
      </Card>

      <div className="space-y-3">
        {categories.map((cat: any) => (
          <Card key={cat.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-sm text-slate-500">/{cat.slug}</p>
            </div>
            <DeleteButton id={cat.id} action={deleteCategory} />
          </Card>
        ))}
        {categories.length === 0 && <p className="text-slate-600">No categories yet.</p>}
      </div>
    </div>
  );
}
