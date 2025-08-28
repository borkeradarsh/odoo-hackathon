'use client';

import { useTransition } from 'react';

import { Switch } from '@/components/ui/switch';

import { toggleUserRole } from './actions';

interface RoleSwitcherProps {
  userId: string;
  currentRole: string;
}

export function RoleSwitcher({ userId, currentRole }: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleToggle = () => {
    startTransition(async () => {
      try {
        await toggleUserRole(userId, currentRole);
      } catch (error) {
        console.error('Failed to toggle user role:', error);
        // You could add toast notification here
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
