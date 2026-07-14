import { PageForm } from '@/components/admin/page-form';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'New Page | GoToWorship',
};
export const dynamic = 'force-dynamic';

export default function NewPagePage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">New Static Page</h1>
      <Card>
        <PageForm />
      </Card>
    </div>
  );
}
