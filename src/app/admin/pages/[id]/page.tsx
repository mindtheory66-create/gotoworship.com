import { notFound } from 'next/navigation';
import { getPageById } from '@/lib/db/pages';
import { PageForm } from '@/components/admin/page-form';
import { Card } from '@/components/ui/card';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Page | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Edit Static Page</h1>
      <Card>
        <PageForm page={page} />
      </Card>
    </div>
  );
}
