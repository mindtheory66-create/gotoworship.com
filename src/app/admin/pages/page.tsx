import Link from 'next/link';
import { getAllPages } from '@/lib/db/pages';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeletePageButton } from '@/components/admin/delete-page-button';
import { FileText, Plus, Calendar } from 'lucide-react';

export const metadata = {
  title: 'Manage Pages | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const pages = await getAllPages();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Static Pages</h1>
          <p className="text-slate-500">Create pages like About, FAQ, Privacy Policy.</p>
        </div>
        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Page
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {pages.map((page) => (
          <Card key={page.id} className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{page.title}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${page.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {page.status}
                  </span>
                  <span className="text-slate-400">/p/{page.slug}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/pages/${page.id}`}>
                <Button size="sm" variant="outline">Edit</Button>
              </Link>
              <DeletePageButton id={page.id} />
            </div>
          </Card>
        ))}
        {pages.length === 0 && <p className="text-slate-600">No pages yet.</p>}
      </div>
    </div>
  );
}
