'use client';

import { useState, useTransition } from 'react';
import { updateSiteSetting } from '@/lib/admin/actions';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import type { SiteSettingKey } from '@/lib/db/site-settings';

interface SettingsFormProps {
  initial: Record<SiteSettingKey, string>;
}

const FIELDS: {
  key: SiteSettingKey;
  label: string;
  description: string;
  rows: number;
}[] = [
  {
    key: 'header_code',
    label: 'Header code injection',
    description:
      'Paste HTML/JS snippets that belong in the <head> tag, such as Google AdSense, Google Analytics 4, Mediavine, or Facebook Pixel code.',
    rows: 10,
  },
  {
    key: 'banner_below_header',
    label: 'Banner below header',
    description:
      'HTML snippet rendered below the navigation bar on every page. Useful for leaderboard ad units.',
    rows: 8,
  },
  {
    key: 'banner_sidebar',
    label: 'Banner below sidebar',
    description:
      'HTML snippet rendered near the bottom of the sidebar on place detail pages. Useful for skyscraper or box ad units.',
    rows: 8,
  },
];

export function SettingsForm({ initial }: SettingsFormProps) {
  const [values, setValues] = useState<Record<SiteSettingKey, string>>(initial);
  const [pending, startTransition] = useTransition();

  const handleSave = (key: SiteSettingKey) => {
    startTransition(async () => {
      try {
        await updateSiteSetting(key, values[key]);
        toast.success('Setting saved successfully');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to save setting');
      }
    });
  };

  return (
    <div className="space-y-6">
      {FIELDS.map((field) => (
        <Card key={field.key} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{field.label}</h2>
            <p className="text-sm text-slate-500">{field.description}</p>
          </div>

          <div>
            <Label htmlFor={field.key} className="sr-only">
              {field.label}
            </Label>
            <Textarea
              id={field.key}
              rows={field.rows}
              value={values[field.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              placeholder={`Paste ${field.label.toLowerCase()} HTML here...`}
              disabled={pending}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={() => handleSave(field.key)} isLoading={pending}>
              Save {field.label}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
