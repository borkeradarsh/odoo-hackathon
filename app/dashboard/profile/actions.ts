// app/dashboard/profile/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
});

// Action to update the user's name
export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const validation = profileSchema.safeParse({
    full_name: formData.get('full_name'),
  });

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: validation.data.full_name })
    .eq('id', user.id);

  if (error) return { error: { database: 'Could not update profile.' } };

  // Revalidate paths to update UI across the app
  revalidatePath('/', 'layout');
  return { success: true };
}

// Action to update the user's avatar URL in the database
export async function updateUserAvatar(avatarUrl: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  // The URL we get from Supabase Storage already includes the path
  // We just need to save it to the user's profile
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  if (error) return { error: { database: 'Could not update avatar.' } };

  revalidatePath('/', 'layout');
  return { success: true };
}
