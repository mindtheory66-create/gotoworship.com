import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('rounded-xl border border-slate-200 bg-white p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';
