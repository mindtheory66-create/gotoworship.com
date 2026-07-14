import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

function noCacheFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    cache: 'no-store',
  } as RequestInit);
}

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        fetch: noCacheFetch,
      },
      realtime: {
        transport: ws as any,
      },
    }
  );
}
