// app/dashboard/profile/page.tsx
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import ProfileForm from './ProfileForm';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the current user's profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
  }

  // If no profile exists, create a default one
  const profileData: Profile = profile || {
    id: user.id,
    full_name: user.user_metadata?.full_name || '',
    avatar_url: null,
  };

  return (
    <div>
      <ProfileForm profile={profileData} userEmail={user.email} />
    </div>
  );
}
