// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import type { Todo } from '@/lib/types/database';

import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null; // This shouldn't happen due to layout protection
  }

  // Fetch user profile with error handling
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  // Fetch all todos for the current user with error handling
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // If tables don't exist, show setup message
  if (profileError?.code === 'PGRST116' || todosError?.code === 'PGRST116') {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">
            Welcome to GGTodo Dashboard!
          </h1>
          <div className="mx-auto max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h2 className="mb-2 text-lg font-medium text-yellow-800">
              Database Setup Required
            </h2>
            <p className="mb-4 text-sm text-yellow-700">
              The database tables need to be created. Please run the migration
              script in your Supabase project.
            </p>
            <div className="rounded bg-gray-800 p-3 font-mono text-xs text-green-400">
              <div>supabase migration new initial_schema</div>
              <div>supabase db push</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle other errors
  if (profileError) {
    console.error('Profile fetch error:', profileError);
  }
  if (todosError) {
    console.error('Todos fetch error:', todosError);
  }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const initialTodos: Todo[] = todos || [];

  return <DashboardClient initialTodos={initialTodos} userName={userName} />;
}
