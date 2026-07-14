'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePage } from '@/lib/admin/blog-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';

export function PageForm({ page }: { page?: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await savePage(formData);
      toast.success(page ? 'Page updated' : 'Page created');
      router.push('/admin/pages');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {page && <input type="hidden" name="id" value={page.id} />}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={page?.title} required />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={page?.slug} placeholder="auto-generated if empty" />
      </div>
      <div>
        <Label htmlFor="content">Content (Markdown supported)</Label>
        <Textarea id="content" name="content" defaultValue={page?.content} rows={16} required />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={page?.status || 'draft'}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
      </div>
      <Button type="submit" isLoading={loading}>
        Save Page
      </Button>
    </form>
  );
}
