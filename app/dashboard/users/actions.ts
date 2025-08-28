// app/dashboard/users/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// Helper function to verify that the current user is a superuser
async function verifySuperuser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'superuser') {
    throw new Error('Unauthorized: requires superuser privileges');
  }
}

// Server Action to fetch all users with their emails and roles
export async function getUsersWithEmail() {
  await verifySuperuser(); // Security check

  // 1. Fetch all authenticated users from the auth schema
  const {
    data: { users },
    error: usersError,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (usersError) throw new Error('Failed to fetch users.');

  // 2. Fetch all profiles from the public schema
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role');
  if (profilesError) throw new Error('Failed to fetch profiles.');

  // 3. Combine the data
  // Create a map of profiles for easy lookup
  const profilesMap = new Map(
    profiles.map((p) => [p.id, { fullName: p.full_name, role: p.role }])
  );

  const combinedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    fullName: profilesMap.get(user.id)?.fullName || 'N/A',
    role: profilesMap.get(user.id)?.role || 'normal user',
  }));

  return combinedUsers;
}

// This action remains the same but we keep it here
export async function toggleUserRole(userId: string, currentRole: string) {
  await verifySuperuser(); // Security check

  const newRole = currentRole === 'superuser' ? 'normal user' : 'superuser';

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw new Error('Failed to update user role.');

  revalidatePath('/dashboard/users'); // Update users page
  revalidatePath('/dashboard'); // Update dashboard layout
}
