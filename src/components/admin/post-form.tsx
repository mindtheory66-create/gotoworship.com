'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { savePost } from '@/lib/admin/blog-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface PostFormProps {
  post?: any;
  categories: any[];
}

export function PostForm({ post, categories }: PostFormProps) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(post?.featured_image || null);
  const objectUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // When the image is cleared on an existing post, send an empty string
    // so the server action removes the featured_image value.
    if (!previewUrl && post?.featured_image) {
      formData.set('featured_image', '');
    }

    try {
      await savePost(formData);
      toast.success(post ? 'Post updated' : 'Post created');
      router.push('/admin/blog/posts');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Save failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      {post?.featured_image && previewUrl && (
        <input type="hidden" name="existing_featured_image" value={post.featured_image} />
      )}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={post?.title} required />
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={post?.slug} placeholder="auto-generated if empty" />
      </div>

      <div>
        <Label htmlFor="category_id">Category</Label>
        <Select id="category_id" name="category_id" defaultValue={post?.category_id || ''}>
          <option value="">None</option>
          {categories.map((cat: any) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={post?.excerpt} rows={3} />
      </div>

      <div>
        <Label htmlFor="featured_image_file">Featured Image</Label>
        <div className="mt-2 space-y-3">
          {previewUrl && (
            <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Featured preview"
                className="max-h-64 w-auto object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute right-2 top-2 rounded-full bg-slate-900/60 p-1 text-white hover:bg-slate-900/80"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Input
              ref={fileInputRef}
              id="featured_image_file"
              name="featured_image_file"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:mr-4 file:rounded-lg file:border-0 file:bg-primary-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-200"
            />
          </div>
          <p className="text-xs text-slate-500">Recommended ratio 16:9. Max 5 MB (JPG, PNG, WebP, GIF, AVIF).</p>
        </div>
      </div>

      <div>
        <Label htmlFor="content">Content (Markdown supported)</Label>
        <Textarea id="content" name="content" defaultValue={post?.content} rows={12} required />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" name="status" defaultValue={post?.status || 'draft'}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
      </div>

      <Button type="submit" isLoading={loading}>
        Save Post
      </Button>
    </form>
  );
}
