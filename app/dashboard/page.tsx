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

  // Fetch recent tasks from projects the user is a member of
  // For now, we'll handle the transition gracefully if tables don't exist yet
  let recentTasks = [];
  let isTasksTableMissing = false;
  
  try {
    console.log('Attempting to fetch tasks for user:', user.id);
    
    // Query using the correct column based on the actual schema
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id) // This matches the actual schema
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Tasks query error details:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId: user.id
      });
      
      // Try a simpler query to test RLS
      console.log('Trying simpler query...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('tasks')
        .select('id, title, user_id, project_id')
        .limit(5);
        
      console.log('Simple query result:', { simpleData, simpleError });
    }
    
    console.log('Tasks query result:', {
      dataCount: data?.length || 0,
      hasError: !!error,
      userId: user.id,
      sampleData: data?.slice(0, 2) // Show first 2 records for debugging
    });
    
    // Filter personal tasks (project_id is null) on the client side for now
    recentTasks = data?.filter(task => task.project_id === null) || [];
    
    // Check if the error is due to missing table
    if (error && typeof error === 'object' && 'code' in error) {
      // PGRST116 = table doesn't exist
      if (error.code === 'PGRST116') {
        isTasksTableMissing = true;
      }
    }
  } catch {
    // Handle case where tasks table doesn't exist yet
    console.log('Tasks table not available yet');
    isTasksTableMissing = true;
    recentTasks = [];
  }

  // If tables don't exist, show setup message
  // Since the user confirmed tables exist, we'll disable this check for now
  const tablesMissing = false; // profileError?.code === 'PGRST116' || isTasksTableMissing;
  
  if (tablesMissing) {
    return (
      <div className="space-y-6">
        <div className="py-12 text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">
            Welcome to SynergySphere Dashboard!
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

  // Handle other errors (but suppress tasks errors during transition period)
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Profile fetch error:', profileError);
  }
  // Temporarily suppressing tasks errors during transition to team-based system
  // if (tasksError && !isTasksTableMissing) {
  //   console.error('Tasks fetch error:', tasksError);
  // }

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';
  // Convert tasks to todo format for compatibility with existing DashboardClient
  const initialTodos: Todo[] = recentTasks.map((task: unknown) => {
    const taskObj = task as Record<string, unknown>;
    
    // Handle both old todos format and new tasks format
    if (isTasksTableMissing) {
      // Old todos format - use directly
      return taskObj as Todo;
    } else {
      // New tasks format - convert to todos format
      return {
        id: taskObj.id?.toString() || '',
        user_id: user.id,
        title: taskObj.title?.toString() || '',
        description: taskObj.description?.toString() || null,
        completed: taskObj.status === 'Done',
        scheduled_at: taskObj.due_date?.toString() || null,
        created_at: taskObj.created_at?.toString() || '',
        updated_at: taskObj.updated_at?.toString() || ''
      };
    }
  });

  return <DashboardClient initialTodos={initialTodos} userName={userName} />;
}
