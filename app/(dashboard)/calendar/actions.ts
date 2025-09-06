// app/(dashboard)/calendar/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

// Get all calendar data for the authenticated user
export async function getPersonalCalendarData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { meetings: [], todos: [], projectTasks: [] };
  }

  try {
    // Get meetings from all projects the user is involved in
    const { data: meetings } = await supabase
      .from('meetings')
      .select(`
        *,
        projects(name)
      `)
      .or(`created_by.eq.${user.id},project_id.in.(${
        // Get project IDs where user is a member
        await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', user.id)
          .then(({ data }) => data?.map(p => p.project_id).join(',') || '0')
      })`);

    // Get personal todos (from tasks table)
    const { data: todos } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .is('project_id', null); // Personal tasks have no project_id

    // Get tasks from projects the user is a member of
    const { data: projectTasks } = await supabase
      .from('tasks')
      .select(`
        *,
        projects(name)
      `)
      .in('project_id', 
        await supabase
          .from('project_members')
          .select('project_id')
          .eq('user_id', user.id)
          .then(({ data }) => data?.map(p => p.project_id) || [])
      );

    return {
      meetings: meetings || [],
      todos: todos || [],
      projectTasks: projectTasks || []
    };
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return { meetings: [], todos: [], projectTasks: [] };
  }
}

// Schedule a new meeting
export async function scheduleMeeting(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  const meetingData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    start_time: formData.get('startTime') as string,
    end_time: formData.get('endTime') as string,
    project_id: formData.get('projectId') as string || null,
    created_by: user.id,
  };

  const { error } = await supabase
    .from('meetings')
    .insert(meetingData);

  if (error) {
    throw new Error(`Failed to schedule meeting: ${error.message}`);
  }

  revalidatePath('/dashboard/calendar');
}

// Create a personal todo
export async function createPersonalTodo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("Not authenticated");

  const todoData = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    scheduled_at: formData.get('scheduledAt') as string || new Date().toISOString(),
    status: 'To-Do',
    user_id: user.id,
    project_id: null, // Personal tasks have no project
    completed: false,
  };

  const { error } = await supabase
    .from('tasks')
    .insert(todoData);

  if (error) {
    throw new Error(`Failed to create todo: ${error.message}`);
  }

  revalidatePath('/dashboard/calendar');
}

// Get user projects for meeting scheduling
export async function getUserProjects() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name
    `)
    .in('id', 
      await supabase
        .from('project_members')
        .select('project_id')
        .eq('user_id', user.id)
        .then(({ data }) => data?.map(p => p.project_id) || [])
    );

  return projects || [];
}
