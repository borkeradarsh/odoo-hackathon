// components/Navbar.tsx
'use client';

import type { User } from '@supabase/supabase-js';
import {
  Bell,
  ChevronDown,
  LogOut,
  PanelRightClose,
  PanelRightOpen,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

import NotificationDrawer from './NotificationDrawer';
import ProfileDrawer from './ProfileDrawer';

interface PartialProfile {
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface NavbarProps {
  user: User;
  profile: PartialProfile | null;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Navbar({
  user,
  profile,
  isCollapsed,
  setIsCollapsed,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="flex h-16 items-center border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center">
          <Image
            src="/assets/synergysphere.svg"
            alt="SynergySphere"
            width={120}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
          <div className="border-b border-gray-200 p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex w-full justify-end p-1"
            >
              {isCollapsed ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {/* Left side - Search */}
        <div className="flex max-w-md flex-1 items-center">
          <div className="relative w-full">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-4 pl-10"
            />
          </div>
        </div>

        {/* Right side - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => setIsSheetOpen(true)}
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 px-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.full_name?.charAt(0) ||
                      user.email?.charAt(0) ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden text-left md:block">
                  <div className="text-sm font-medium text-gray-900">
                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {profile?.role || 'Member'}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">
                  {profile?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <NotificationDrawer
        isSheetOpen={isSheetOpen}
        setIsSheetOpen={setIsSheetOpen}
      />

      <ProfileDrawer
        isSheetOpen={isProfileOpen}
        setIsSheetOpen={setIsProfileOpen}
        user={user}
        profile={profile}
      />
    </nav>
  );
}
