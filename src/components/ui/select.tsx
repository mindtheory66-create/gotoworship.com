import { cn } from '@/lib/utils/cn';
import { SelectHTMLAttributes, forwardRef } from 'react';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
