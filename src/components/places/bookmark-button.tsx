'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

export function BookmarkButton({ placeId }: { placeId: string }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setChecking(false);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setChecking(false);
          return;
        }
        const { data } = await supabase
          .from('user_bookmarks')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('place_id', placeId)
          .maybeSingle();
        setSaved(!!data);
      } catch {
        // Fail silently: allow the user to click and see the login prompt.
      } finally {
        setChecking(false);
      }
    }
    check();
  }, [supabase, placeId]);

  const toggle = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login to bookmark');
        return;
      }

      if (saved) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', session.user.id)
          .eq('place_id', placeId);
        if (!error) {
          setSaved(false);
          toast.success('Removed from bookmarks');
        }
      } else {
        const { error } = await supabase.from('user_bookmarks').insert({ user_id: session.user.id, place_id: placeId });
        if (!error) {
          setSaved(true);
          toast.success('Saved to bookmarks');
        }
      }
    } catch {
      toast.error('Unable to update bookmark. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBusy = loading || checking;
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={toggle}
      isLoading={isBusy}
      className={saved ? 'text-primary-600' : ''}
    >
      {isBusy ? (
        loading ? 'Saving...' : 'Loading...'
      ) : (
        <>
          <Bookmark className={`mr-2 h-4 w-4 ${saved ? 'fill-current' : ''}`} />
          {saved ? 'Saved' : 'Save'}
        </>
      )}
    </Button>
  );
}
