export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!url || !anon || !service) return false;
  if (url.includes('your-project')) return false;
  if (anon.includes('your-') || service.includes('your-')) return false;
  return true;
}

export function isDeepSeekConfigured(): boolean {
  const key = process.env.DEEPSEEK_API_KEY || '';
  return Boolean(key && !key.includes('your-'));
}
