'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Building2, Briefcase } from 'lucide-react';
import { Logo } from '@/components/layout/logo';

interface OnboardingModalProps {
  open: boolean;
  loading: boolean;
  onSubmit: (data: {
    role: 'user' | 'contributor';
    organization: string;
    position: string;
  }) => void;
}

export function OnboardingModal({ open, loading, onSubmit }: OnboardingModalProps) {
  const [role, setRole] = useState<'user' | 'contributor'>('user');
  const [organization, setOrganization] = useState('');
  const [position, setPosition] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4">
      <Card className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mb-4 flex justify-center">
            <Logo width={150} height={35} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Almost there!</h2>
          <p className="mt-2 text-slate-500">
            Choose how you want to use GoToWorship. You can change this later from your profile.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ role, organization, position });
          }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="onboarding-role">I want to join as</Label>
            <Select
              id="onboarding-role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'contributor')}
            >
              <option value="user">User - discover & bookmark places</option>
              <option value="contributor">Contributor - add events & help the community</option>
            </Select>
          </div>
          {role === 'contributor' && (
            <>
              <div>
                <Label htmlFor="onboarding-organization">Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="onboarding-organization"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="pl-10"
                    placeholder="Church, ministry, community..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="onboarding-position">Position</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    id="onboarding-position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="pl-10"
                    placeholder="Pastor, volunteer, leader..."
                  />
                </div>
              </div>
            </>
          )}
          <Button type="submit" isLoading={loading} className="w-full">
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
