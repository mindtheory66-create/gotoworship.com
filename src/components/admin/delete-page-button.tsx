import { DeleteButton } from './delete-button';
import { deletePage } from '@/lib/admin/blog-actions';

export function DeletePageButton({ id }: { id: string }) {
  return <DeleteButton id={id} action={deletePage} />;
}
