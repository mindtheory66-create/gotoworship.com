'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

export async function updatePlaceStatus(placeId: string, status: 'draft' | 'ai_generated' | 'published') {
  const admin = createAdminClient();
  const { error } = await admin.from('places').update({ status }).eq('id', placeId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/[state]/[city]/[slug]', 'page');
  return { success: true };
}

export async function deletePlace(placeId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from('places').delete().eq('id', placeId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/admin/places');
  return { success: true };
}

export async function updateEventStatus(eventId: string, status: 'pending' | 'approved' | 'rejected') {
  const admin = createAdminClient();
  const { error } = await admin.from('events').update({ status }).eq('id', eventId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/events');
  return { success: true };
}

export async function updateUserRole(userId: string, role: 'user' | 'contributor' | 'admin', approved: boolean) {
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ role, approved }).eq('id', userId);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateSiteSetting(key: string, value: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/[state]/[city]/[slug]', 'page');
  revalidatePath('/admin/settings');
  return { success: true };
}
