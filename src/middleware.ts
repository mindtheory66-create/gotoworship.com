import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { slugify } from '@/lib/utils/slugify';

function normalizePathname(pathname: string): string | null {
  const decoded = decodeURIComponent(pathname);
  // Skip paths that are already well-formed. We only redirect when a segment
  // contains spaces, underscores, mixed casing, or special chars that slugify
  // would change. This fixes legacy `%20` city/state URLs.
  const segments = decoded.split('/').filter(Boolean);
  const normalized = segments.map((segment) => slugify(segment));
  if (normalized.some((ns, i) => ns !== segments[i])) {
    return '/' + normalized.join('/');
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Redirect legacy/ugly URLs (e.g. `/north%20carolina/statesville`) to
  //    clean hyphenated slugs with a 301. This fixes a major duplicate-content
  //    risk because the rest of the app now links to hyphenated URLs.
  const normalized = normalizePathname(pathname);
  if (normalized && normalized !== pathname) {
    return NextResponse.redirect(new URL(normalized + search, request.url), 301);
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Protect admin/contributor routes.
  const isAdmin = pathname.startsWith('/admin');
  const isContributor = pathname.startsWith('/contributor');

  if (isAdmin || isContributor) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (isAdmin) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    if (isContributor) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, approved')
        .eq('id', user.id)
        .single();
      if (!profile || (profile.role !== 'contributor' && profile.role !== 'admin') || !profile.approved) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|static|.*\\..*).*)'],
};
