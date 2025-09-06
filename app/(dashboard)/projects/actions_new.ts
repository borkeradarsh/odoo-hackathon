// app/(dashboard)/projects/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Security check - only superusers can create projects
  const { data: isSuperuser, error: rpcError } = await supabase.rpc('is_superuser');
  if (rpcError || !isSuperuser) {
    throw new Error("Unauthorized: Only superusers can create projects");
  }

  // Get and validate project name
  const projectName = formData.get('name') as string;
  if (!projectName || projectName.length < 3) {
    throw new Error("Project name must be at least 3 characters long");
  }

  // Insert new project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name: projectName,
      created_by: user.id
    })
    .select()
    .single();

  if (projectError) {
    throw new Error("Failed to create project");
  }

  // Add creator as first member of the project
  const { error: memberError } = await supabase
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id
    });

  if (memberError) {
    throw new Error("Failed to add creator as project member");
  }

  // Refresh the projects page
  revalidatePath('/projects');
}

export async function getProjectsForUser() {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return [];
  }

  try {
    // Simple select - RLS policies will handle filtering automatically
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return projects || [];
  } catch (error) {
    console.error('Unexpected error fetching projects:', error);
    return [];
  }
}

export async function updateTaskStatus(taskId: number, newStatus: string) {
  const supabase = await createClient();
  
  // Verify user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Update task status - RLS policies will handle access control
  const { error } = await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId);

  if (error) {
    throw new Error("Failed to update task status");
  }

  // Note: No revalidatePath call - UI updates handled by real-time subscription
}
