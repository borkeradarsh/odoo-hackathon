// app/(dashboard)/projects/actions.ts
'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Get all projects (RLS is disabled for demo)
export async function getProjectsForUser() {
  const supabase = await createClient();
  const { data } = await supabase.from('projects').select('*');
  return data || [];
}

// Create a project and add the creator as a member
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const projectName = formData.get('name') as string;
  const { data: project } = await supabase.from('projects').insert({ name: projectName, created_by: user.id }).select().single();
  if (project) {
    await supabase.from('project_members').insert({ project_id: project.id, user_id: user.id });
  }
  revalidatePath('/dashboard/projects');
}

// Get tasks for a specific project
export async function getTasksForProject(projectId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('tasks').select('*, profiles (full_name, avatar_url)').eq('project_id', projectId);
    return data || [];
}

// Create a task in a project
export async function createTaskInProject(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const taskData = {
        project_id: formData.get('projectId'),
        title: formData.get('title'),
        status: 'To-Do',
        user_id: user.id, // Creator ID
    };
    await supabase.from('tasks').insert(taskData);
    revalidatePath(`/dashboard/projects/${taskData.project_id}`);
}

// Get meetings for a project
export async function getMeetingsForProject(projectId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('meetings').select('*').eq('project_id', projectId);
    return data || [];
}

// Schedule a meeting
export async function scheduleMeeting(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    
    const meetingData = {
        project_id: formData.get('projectId'),
        title: formData.get('title'),
        start_time: formData.get('startTime'),
        end_time: formData.get('endTime'),
        created_by: user.id,
    };
    await supabase.from('meetings').insert(meetingData);
    revalidatePath(`/dashboard/projects/${meetingData.project_id}/calendar`);
}

// Get a single project by ID
export async function getProjectById(projectId: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single();
    return data;
}
