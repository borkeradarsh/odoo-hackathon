'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Loader2, LogOut, Upload, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  updateUserAvatar,
  updateUserProfile,
} from '@/app/dashboard/profile/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createClient } from '@/lib/supabase/client';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface PartialProfile {
  role: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface ProfileDrawerProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  user: SupabaseUser;
  profile: PartialProfile | null;
}

export default function ProfileDrawer({
  isSheetOpen,
  setIsSheetOpen,
  user,
  profile,
}: ProfileDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(profile?.avatar_url);
  const [formError, setFormError] = useState<string | null>(null);
  const [todos, setTodos] = useState({ all: 0, upcoming: 0, completed: 0 });
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
    },
  });

  const supabase = createClient();

  // Reset form when profile changes
  useEffect(() => {
    reset({
      full_name: profile?.full_name || '',
    });
    setCurrentAvatarUrl(profile?.avatar_url);
  }, [profile, reset]);

  // Fetch user's todo statistics
  useEffect(() => {
    const fetchTodoStats = async () => {
      if (!isSheetOpen) return;

      try {
        // Fetch all todos count
        const { count: allCount } = await supabase
          .from('todos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch upcoming todos count (not completed and due in future)
        const now = new Date().toISOString();
        const { count: upcomingCount } = await supabase
          .from('todos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false)
          .gte('scheduled_at', now);

        // Fetch completed todos count
        const { count: completedCount } = await supabase
          .from('todos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        setTodos({
          all: allCount || 0,
          upcoming: upcomingCount || 0,
          completed: completedCount || 0,
        });
      } catch (error) {
        console.error('Error fetching todo stats:', error);
      }
    };

    fetchTodoStats();
  }, [supabase, user.id, isSheetOpen]);

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormError('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('File size must be less than 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setFormError(null);

    try {
      // Create a unique file path using user ID and timestamp
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlData.publicUrl) {
        // Update the avatar URL in the database
        const result = await updateUserAvatar(urlData.publicUrl);

        if (result.error) {
          setFormError('Failed to update avatar in database.');
        } else {
          setCurrentAvatarUrl(urlData.publicUrl);
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setFormError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const formData = new FormData();
      formData.append('full_name', data.full_name);

      const result = await updateUserProfile(formData);

      if (result?.error) {
        // Handle validation errors
        if ('full_name' in result.error && result.error.full_name) {
          setError('full_name', { message: result.error.full_name[0] });
        }
        // Handle database errors
        if ('database' in result.error && result.error.database) {
          setFormError(result.error.database);
        }
      } else {
        // Success feedback could be added here
        setFormError(null);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setFormError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsSheetOpen(false);
    router.push('/login');
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Profile</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={currentAvatarUrl || undefined}
                  alt="Profile picture"
                />
                <AvatarFallback className="bg-green-100 text-lg text-green-600">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              {profile?.role && (
                <div className="absolute -right-1 -bottom-1 rounded-full bg-green-500 px-2 py-1 text-xs text-white">
                  {profile.role}
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2 px-3">
            <Label
              htmlFor="full_name"
              className="text-sm font-medium text-gray-700"
            >
              Name
            </Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Enter your full name"
              disabled={isSubmitting}
              className="w-full"
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Email Display */}
          <div className="space-y-2 px-3">
            <Label className="text-sm font-medium text-gray-700">Email</Label>
            <Input
              value={user.email || 'user@example.com'}
              disabled
              className="w-full bg-gray-50"
            />
          </div>

          {/* Update Profile Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-green-500 px-8 text-green-100 hover:bg-green-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>

          {/* Todo Statistics */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">All Todos</p>
                <p className="text-2xl font-bold text-gray-900">{todos.all}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todos.upcoming}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todos.completed}
                </p>
              </div>
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="flex justify-center space-y-2">
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={isUploadingAvatar}
              className="hidden"
            />
            <Label
              htmlFor="avatar-upload"
              className="ring-offset-background focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-10 cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </>
              )}
            </Label>
          </div>

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{formError}</p>
            </div>
          )}
          <div className="flex justify-center">
            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center justify-center border-gray-300 px-4 text-red-600 hover:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
