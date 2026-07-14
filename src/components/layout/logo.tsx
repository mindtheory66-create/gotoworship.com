'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface LogoProps {
  href?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Logo({ href = '/', width = 180, height = 42, className }: LogoProps) {
  return (
    <Link href={href} className={cn('inline-flex items-center', className)}>
      <Image
        src="/images/gotoworship%20logo.png"
        alt="GoToWorship"
        width={width}
        height={height}
        priority
        className="h-auto w-auto max-w-full object-contain"
      />
    </Link>
  );
}
