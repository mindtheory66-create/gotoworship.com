import { DeleteButton } from './delete-button';
import { deletePost } from '@/lib/admin/blog-actions';

export function DeletePostButton({ id }: { id: string }) {
  return <DeleteButton id={id} action={deletePost} />;
}
