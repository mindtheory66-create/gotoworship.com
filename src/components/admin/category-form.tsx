'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveCategory } from '@/lib/admin/blog-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

export function CategoryForm({ category }: { category?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveCategory(formData);
      toast.success(category ? 'Category updated' : 'Category created');
      router.refresh();
      (e.target as HTMLFormElement).reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-4">
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="flex-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>
      <div className="flex-1">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={category?.slug} placeholder="auto-generated" />
      </div>
      <div className="self-end">
        <Button type="submit" isLoading={loading}>
          {category ? 'Update' : 'Add'} Category
        </Button>
      </div>
    </form>
  );
}
