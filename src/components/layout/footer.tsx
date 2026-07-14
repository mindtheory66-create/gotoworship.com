import Link from 'next/link';
import { getAllPages } from '@/lib/db/pages';
import { Logo } from '@/components/layout/logo';
import { Heart } from 'lucide-react';
import { CONTACT_EMAIL, LEGAL_ENTITY, LEGAL_ADDRESS } from '@/lib/config/site';

export async function Footer() {
  const pages = await getAllPages();
  const publishedPages = pages.filter((p) => p.status === 'published').slice(0, 5);

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary-600" />
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo width={180} height={42} />
            </div>
            <p className="max-w-sm text-slate-500">
              Discover mosques, churches, synagogues, temples, and other places of worship across the United States.
            </p>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Explore</h5>
            <ul className="space-y-3 text-slate-600">
              <li><Link href="/near-me" className="hover:text-primary-600">Near Me</Link></li>
              <li><Link href="/locations" className="hover:text-primary-600">Locations</Link></li>
              <li><Link href="/blog" className="hover:text-primary-600">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Company</h5>
            <ul className="space-y-3 text-slate-600">
              <li><Link href="/about" className="hover:text-primary-600">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary-600">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-primary-600">FAQ</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-600">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary-600">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Contact</h5>
            <ul className="space-y-3 text-slate-600">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary-600">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="text-sm">
                {LEGAL_ENTITY}<br />
                {LEGAL_ADDRESS.street}<br />
                {LEGAL_ADDRESS.city}, {LEGAL_ADDRESS.state} {LEGAL_ADDRESS.zip}
              </li>
            </ul>
          </div>

          {publishedPages.length > 0 && (
            <div>
              <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Pages</h5>
              <ul className="space-y-3 text-slate-600">
                {publishedPages.map((page) => (
                  <li key={page.id}>
                    <Link href={`/p/${page.slug}`} className="hover:text-primary-600">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-8 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} GoToWorship. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> for communities
          </p>
        </div>
      </div>
    </footer>
  );
}
