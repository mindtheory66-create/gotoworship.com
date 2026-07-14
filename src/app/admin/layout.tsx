import Link from 'next/link';
import { Logo } from '@/components/layout/logo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/places', label: 'Places' },
  { href: '/admin/import', label: 'Import CSV' },
  { href: '/admin/queue', label: 'Queue' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/blog/posts', label: 'Blog' },
  { href: '/admin/pages', label: 'Pages' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col bg-slate-50 md:flex-row">
      <aside className="w-full border-b border-slate-200 bg-white md:w-64 md:border-b-0 md:border-r">
        <div className="p-4">
          <div className="mb-4 px-4">
            <Logo width={150} height={35} />
          </div>
          <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400">Admin Menu</p>
          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
