'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ProfileRole } from '@/types';

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Not authenticated');
  }

  const role = formData.get('role') as ProfileRole;
  const organization = (formData.get('organization') as string) || '';
  const position = (formData.get('position') as string) || '';

  if (role !== 'user' && role !== 'contributor') {
    throw new Error('Invalid role');
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({
      role,
      organization: organization || null,
      position: position || null,
      approved: role === 'contributor' ? false : true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/');
  return { success: true, role, approved: role === 'user' };
}
