'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Upload, FileSpreadsheet } from 'lucide-react';

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ total: number; queued: number; results: any[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import/process-csv', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setResults(data);
      toast.success(`Queued ${data.queued} of ${data.total} places`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Import Places</h1>
      <p className="mb-8 text-slate-500">Upload a CSV or XLSX file to queue places for AI content generation.</p>

      <Card className="mb-8 border-t-4 border-t-primary-600">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center transition-colors hover:border-primary-300 hover:bg-primary-50/30">
            <FileSpreadsheet className="mb-3 h-12 w-12 text-primary-500" />
            <Label htmlFor="file" className="cursor-pointer text-lg font-semibold text-slate-700">
              {file ? file.name : 'Choose a CSV or XLSX file'}
            </Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="mt-3 max-w-sm border-0 bg-transparent text-center shadow-none file:mx-auto file:rounded-lg file:bg-primary-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-700"
            />
          </div>
          <div className="space-y-2 text-sm text-slate-500">
            <p>
              For XLSX (scraped data): maps <span className="font-semibold text-slate-700">title, address_info_*, latitude, longitude, phone, url, main_image, contact_info, attributes, work_time</span> automatically.
            </p>
            <p>
              For CSV: required <span className="font-semibold text-slate-700">name, city, state, religion, latitude, longitude</span>. Optional: address, zip, denomination, phone, website, email, language, facilities, image_url1-3, schedule_notes.
            </p>
          </div>
          <Button type="submit" isLoading={loading} disabled={!file} className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" /> Queue Import
          </Button>
        </form>
      </Card>

      <div className="mb-6 rounded-xl border border-primary-100 bg-primary-50 p-4">
        <p className="text-sm text-primary-800">
          After upload, run the worker to process images and generate AI content:{' '}
          <code className="rounded-lg bg-white px-2 py-1 font-semibold text-primary-700">npm run queue:worker</code>
        </p>
      </div>

      {results && (
        <Card>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Queued: {results.queued} / {results.total} rows
          </h2>
          <div className="max-h-96 overflow-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((r) => (
                  <tr key={r.row} className="border-t border-slate-100">
                    <td className="px-4 py-3">{r.row}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
