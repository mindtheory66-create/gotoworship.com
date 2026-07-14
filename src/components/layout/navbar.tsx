'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Profile } from '@/types';
import { Menu, X, Search } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        setProfile(data as Profile | null);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/near-me', label: 'Near Me' },
    { href: '/locations', label: 'Locations' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Logo width={160} height={38} />

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
          }}
          className="hidden max-w-xs flex-1 items-center gap-2 lg:flex"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search worship places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9"
              aria-label="Search places of worship"
            />
          </div>
        </form>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && !profile && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
          {!loading && profile && (
            <>
              {profile.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
              {profile.role === 'contributor' && (
                <Link href="/contributor/events/new">
                  <Button variant="ghost" size="sm">Submit Event</Button>
                </Link>
              )}
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2 ${active ? 'bg-primary-50 font-semibold text-primary-700' : 'text-slate-700 hover:bg-primary-50 hover:text-primary-600'}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
                  setMobileOpen(false);
                }
              }}
              className="px-4 py-2"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  type="search"
                  placeholder="Search worship places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9"
                  aria-label="Search places of worship"
                />
              </div>
            </form>
            {!loading && !profile && (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-slate-700 hover:bg-primary-50">Login</Link>
                <Link href="/register" className="rounded-lg px-4 py-2 text-slate-700 hover:bg-primary-50">Register</Link>
              </>
            )}
            {!loading && profile && (
              <>
                {profile.role === 'admin' && (
                  <Link href="/admin/dashboard" className="rounded-lg px-4 py-2 text-slate-700 hover:bg-primary-50">Admin</Link>
                )}
                <button onClick={handleLogout} className="rounded-lg px-4 py-2 text-left text-slate-700 hover:bg-primary-50">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
