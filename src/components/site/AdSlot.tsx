import { cn } from '@/lib/utils/cn';

interface AdSlotProps {
  code: string;
  className?: string;
}

export function AdSlot({ code, className }: AdSlotProps) {
  if (!code || !code.trim()) return null;

  return (
    <div
      className={cn('ad-slot', className)}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
