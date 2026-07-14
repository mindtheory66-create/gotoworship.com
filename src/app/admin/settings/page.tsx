import { getSiteSettings } from '@/lib/db/site-settings';
import { SettingsForm } from './SettingsForm';

export const metadata = {
  title: 'Site Settings | GoToWorship Admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
        <p className="mt-1 text-slate-500">
          Manage header code injection and ad banner slots across the site.
        </p>
      </div>

      <SettingsForm initial={settings} />
    </div>
  );
}
