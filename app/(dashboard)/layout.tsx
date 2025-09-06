// app/(dashboard)/layout.tsx
'use client';

import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { createClient } from '@/lib/supabase/client';

interface PartialProfile {
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: ClientLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PartialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', userId)
      .single();

    setProfile(profile);
    return profile;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/login');
        return;
      }

      setUser(user);

      try {
        await fetchProfile(user.id);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // This will never be reached due to redirect, but needed for TypeScript
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Top Navbar */}
      <Navbar
        user={user}
        profile={profile}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content area below navbar */}
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar isCollapsed={isCollapsed} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
