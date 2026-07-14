'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Place } from '@/types';
import { buildPlaceUrl } from '@/lib/utils/slugify';
import { updatePlaceStatus, deletePlace } from '@/lib/admin/actions';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';
import { ExternalLink, Trash2 } from 'lucide-react';

interface PlacesTableProps {
  places: Place[];
}

export function PlacesTable({ places }: PlacesTableProps) {
  const [items, setItems] = useState(places);

  const handleStatusChange = async (placeId: string, status: string) => {
    try {
      await updatePlaceStatus(placeId, status as any);
      setItems((prev) => prev.map((p) => (p.id === placeId ? { ...p, status: status as any } : p)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (placeId: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deletePlace(placeId);
      setItems((prev) => prev.filter((p) => p.id !== placeId));
      toast.success('Place deleted');
    } catch {
      toast.error('Failed to delete place');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-4 font-bold text-slate-700">Name</th>
            <th className="px-5 py-4 font-bold text-slate-700">City</th>
            <th className="px-5 py-4 font-bold text-slate-700">Religion</th>
            <th className="px-5 py-4 font-bold text-slate-700">Status</th>
            <th className="px-5 py-4 font-bold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((place) => (
            <tr key={place.id} className="border-t border-slate-100">
              <td className="px-5 py-4 font-semibold text-slate-900">{place.name}</td>
              <td className="px-5 py-4 text-slate-600">{place.city}, {place.state}</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">{place.religion}</span>
              </td>
              <td className="px-5 py-4">
                <Select
                  value={place.status}
                  onChange={(e) => handleStatusChange(place.id, e.target.value)}
                  className="w-36"
                >
                  <option value="draft">Draft</option>
                  <option value="ai_generated">AI Generated</option>
                  <option value="published">Published</option>
                </Select>
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-2">
                  <Link
                    href={buildPlaceUrl(place)}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
                  >
                    <ExternalLink className="h-4 w-4" /> View
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(place.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
