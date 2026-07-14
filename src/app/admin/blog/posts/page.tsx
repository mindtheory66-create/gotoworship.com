import Link from 'next/link';
import { getAllPosts } from '@/lib/db/blog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeletePostButton } from '@/components/admin/delete-post-button';
import { Calendar, Plus, Tag } from 'lucide-react';

export const metadata = {
  title: 'Manage Blog Posts | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function AdminBlogPostsPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-slate-500">Manage articles and publish to the public blog.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/blog/categories">
            <Button variant="secondary">
              <Tag className="mr-2 h-4 w-4" /> Categories
            </Button>
          </Link>
          <Link href="/admin/blog/posts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post: any) => (
          <Card key={post.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(post.created_at).toLocaleDateString()}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {post.status}
                </span>
                {post.category && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">{post.category.name}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/blog/posts/${post.id}`}>
                <Button size="sm" variant="outline">Edit</Button>
              </Link>
              <DeletePostButton id={post.id} />
            </div>
          </Card>
        ))}
        {posts.length === 0 && <p className="text-slate-600">No posts yet.</p>}
      </div>
    </div>
  );
}
