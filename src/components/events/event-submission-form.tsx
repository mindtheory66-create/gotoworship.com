'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import toast from 'react-hot-toast';

interface PlaceOption {
  id: string;
  name: string;
}

export function EventSubmissionForm({ places }: { places: PlaceOption[] }) {
  const [placeId, setPlaceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('You must be logged in.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('events').insert({
      place_id: placeId,
      user_id: session.user.id,
      title,
      description,
      start_datetime: new Date(start).toISOString(),
      end_datetime: end ? new Date(end).toISOString() : null,
      category,
      status: 'pending',
    });

    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Event submitted for moderation.');
      router.push('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="place">Place of Worship</Label>
        <Select id="place" value={placeId} onChange={(e) => setPlaceId(e.target.value)} required>
          <option value="">Select a place</option>
          {places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="title">Event Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="start">Start Date & Time</Label>
          <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="end">End Date & Time</Label>
          <Input id="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Sermon, Iftar, Youth" />
      </div>
      <Button type="submit" isLoading={loading} className="w-full">
        Submit Event
      </Button>
    </form>
  );
}
