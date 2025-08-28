// app/dashboard/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

// Zod schema for validating a new todo
const todoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  scheduled_at: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return date >= today;
    },
    {
      message: 'Due date cannot be in the past.',
    }
  ),
});

// --- CREATE TODO ---
export async function addTodo(formData: FormData) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Authentication required');

    const validation = todoSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description'),
      scheduled_at: formData.get('due_date'), // Frontend sends as 'due_date' but we map to 'scheduled_at'
    });

    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors };
    }

    const todoData = {
      user_id: user.id,
      title: validation.data.title,
      description: validation.data.description,
      scheduled_at: validation.data.scheduled_at.toISOString(),
    };

    const { error } = await supabase.from('todos').insert(todoData);

    if (error) {
      return { error: { database: 'Could not create todo.' } };
    }

    revalidatePath('/dashboard'); // Refresh the dashboard page
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in addTodo:', err);
    return { error: { database: 'An unexpected error occurred.' } };
  }
}

// --- UPDATE TODO ---
export async function updateTodo(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const todoId = formData.get('id');
  if (!todoId) return { error: { general: 'Todo ID is missing.' } };

  const validation = todoSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    scheduled_at: formData.get('due_date'), // Frontend sends as 'due_date' but we map to 'scheduled_at'
  });

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('todos')
    .update({
      title: validation.data.title,
      description: validation.data.description,
      scheduled_at: validation.data.scheduled_at.toISOString(),
    })
    .eq('id', todoId)
    .eq('user_id', user.id); // Ensure user can only update their own todo

  if (error) return { error: { database: 'Could not update todo.' } };

  revalidatePath('/dashboard');
  return { success: true };
}

// --- DELETE TODO ---
export async function deleteTodo(todoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', todoId)
    .eq('user_id', user.id); // Ensure user can only delete their own todo

  if (error) return { error: { database: 'Could not delete todo.' } };

  revalidatePath('/dashboard');
  return { success: true };
}

// --- NOTIFICATION ACTION ---
export async function getNotifications() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  const now = new Date();
  const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  // Fetch upcoming todos due in the next 4 hours
  const { data: upcoming, error: upcomingError } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('completed', false)
    .gte('scheduled_at', now.toISOString()) // Greater than or equal to now
    .lte('scheduled_at', fourHoursFromNow.toISOString()) // Less than or equal to 4 hours from now
    .order('scheduled_at', { ascending: true });

  if (upcomingError) {
    console.error('Error fetching upcoming todos:', upcomingError);
    throw new Error('Could not fetch upcoming todos.');
  }

  // Fetch the 5 most recently completed todos
  const { data: completed, error: completedError } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('created_at', { ascending: false }) // Assuming you want the most recently created ones that are completed
    .limit(5);

  if (completedError) {
    console.error('Error fetching completed todos:', completedError);
    throw new Error('Could not fetch completed todos.');
  }

  return { upcoming, completed };
}

// --- TOGGLE TODO STATUS ---
export async function toggleTodoStatus(todoId: string, currentState: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required');

  const { error } = await supabase
    .from('todos')
    .update({ completed: !currentState })
    .eq('id', todoId)
    .eq('user_id', user.id); // Security check

  if (error) {
    return { error: { database: 'Could not update todo status.' } };
  }

  revalidatePath('/dashboard'); // Refresh the main dashboard
  revalidatePath('/dashboard/profile'); // Also refresh other pages if needed
  return { success: true };
}
