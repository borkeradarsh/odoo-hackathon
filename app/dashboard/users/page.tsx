// app/dashboard/users/page.tsx
'use client';

import { Filter, Plus } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import { getUsersWithEmail, toggleUserRole } from './actions';

type User = {
  id: string;
  email: string | undefined;
  fullName: string;
  role: string;
};

// Client Component for Role Switcher
function RoleSwitcher({
  userId,
  currentRole,
  onRoleChange,
}: {
  userId: string;
  currentRole: string;
  onRoleChange: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const handleRoleToggle = () => {
    startTransition(async () => {
      try {
        await toggleUserRole(userId, currentRole);
        onRoleChange(); // Refresh the users list
      } catch (error) {
        console.error('Failed to toggle user role:', error);
      }
    });
  };

  return (
    <Switch
      checked={currentRole === 'superuser'}
      onCheckedChange={handleRoleToggle}
      disabled={isPending}
    />
  );
}

// Main Page Component
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    try {
      const fetchedUsers = await getUsersWithEmail();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to refresh users:', error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsersWithEmail();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl bg-gray-100 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">All Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="bg-green-500 hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" />
            Add Users
          </Button>
        </div>
      </div>

      {/* Header Row */}
      <div className="flex items-center justify-between rounded-lg bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
        <div className="flex-1">Name</div>
        <div className="w-32 text-center">Role</div>
        <div className="w-24 text-center">Actions</div>
      </div>

      {/* Users List */}
      <div className="space-y-1">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border-b border-gray-200 px-4 py-4 hover:bg-gray-50"
          >
            {/* Left: User Info */}
            <div className="flex-1">
              <div className="font-bold text-gray-900">{user.fullName}</div>
              <div className="text-sm text-gray-700">
                {user.email || 'No email'}
              </div>
            </div>

            {/* Middle: Role */}
            <div className="w-32 text-center">
              <span className="text-sm text-gray-700">
                {user.role === 'superuser' ? 'Super Admin' : 'User'}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex w-24 justify-center">
              <RoleSwitcher
                userId={user.id}
                currentRole={user.role}
                onRoleChange={refreshUsers}
              />
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}
    </div>
  );
}
