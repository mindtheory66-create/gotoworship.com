'use client';

import { useState } from 'react';
import { Profile } from '@/types';
import { updateUserRole } from '@/lib/admin/actions';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { Save, User } from 'lucide-react';

interface UsersTableProps {
  users: Profile[];
}

export function UsersTable({ users }: UsersTableProps) {
  const [items, setItems] = useState(users);

  const save = async (user: Profile) => {
    try {
      await updateUserRole(user.id, user.role, user.approved);
      toast.success('User updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-5 py-4 font-bold text-slate-700">User</th>
            <th className="px-5 py-4 font-bold text-slate-700">Role</th>
            <th className="px-5 py-4 font-bold text-slate-700">Approved</th>
            <th className="px-5 py-4 font-bold text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((user) => (
            <tr key={user.id} className="border-t border-slate-100">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-slate-900">{user.full_name || user.id}</span>
                </div>
              </td>
              <td className="px-5 py-4">
                <Select
                  value={user.role}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((u) => (u.id === user.id ? { ...u, role: e.target.value as any } : u))
                    )
                  }
                  className="w-36"
                >
                  <option value="user">User</option>
                  <option value="contributor">Contributor</option>
                  <option value="admin">Admin</option>
                </Select>
              </td>
              <td className="px-5 py-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={user.approved}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((u) => (u.id === user.id ? { ...u, approved: e.target.checked } : u))
                      )
                    }
                    className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-slate-600">{user.approved ? 'Yes' : 'No'}</span>
                </label>
              </td>
              <td className="px-5 py-4">
                <Button size="sm" onClick={() => save(user)}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
