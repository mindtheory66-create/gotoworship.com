'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { OnboardingModal } from '@/app/(auth)/_components/onboarding-modal';
import { completeOnboarding } from '@/lib/auth/actions';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import type { Profile } from '@/types';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const redirectByProfile = (profile: Profile | null) => {
    if (profile?.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (profile?.role === 'contributor' && profile.approved) {
      router.push('/contributor/events/new');
    } else if (profile?.role === 'contributor' && !profile.approved) {
      toast('Contributor account pending admin approval.', { icon: '⏳' });
      router.push('/');
    } else {
      router.push('/');
    }
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (!data.user) {
      toast.error('Login failed');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile?.role === 'admin') {
      toast.success('Welcome back, admin');
      redirectByProfile(profile as Profile);
      return;
    }

    if (profile && !(profile as Profile).onboarding_completed) {
      setPendingProfile(profile as Profile);
      setShowOnboarding(true);
      return;
    }

    toast.success('Logged in successfully');
    redirectByProfile(profile as Profile);
  };

  const handleOnboarding = async (values: {
    role: 'user' | 'contributor';
    organization: string;
    position: string;
  }) => {
    setOnboardingLoading(true);
    const formData = new FormData();
    formData.append('role', values.role);
    formData.append('organization', values.organization);
    formData.append('position', values.position);

    try {
      await completeOnboarding(formData);
      toast.success('Welcome to GoToWorship!');
      setShowOnboarding(false);
      redirectByProfile({ ...pendingProfile, ...values, approved: values.role === 'user' } as Profile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save role';
      toast.error(message);
    } finally {
      setOnboardingLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4 py-16">
        <Card className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo width={180} height={42} className="mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="mt-2 text-slate-500">Sign in to manage your account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              Login <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-primary-600 hover:underline">
              Register
            </Link>
          </p>
        </Card>
      </div>
      <OnboardingModal
        open={showOnboarding}
        loading={onboardingLoading}
        onSubmit={handleOnboarding}
      />
    </>
  );
}
