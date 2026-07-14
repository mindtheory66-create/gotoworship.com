'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ success: boolean }>;
  label?: string;
}

export function DeleteButton({ id, action, label = 'Delete' }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm('Are you sure?')) return;
    startTransition(async () => {
      try {
        await action(id);
        toast.success('Deleted successfully');
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        toast.error(message);
      }
    });
  };

  return (
    <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isPending}>
      {label}
    </Button>
  );
}
