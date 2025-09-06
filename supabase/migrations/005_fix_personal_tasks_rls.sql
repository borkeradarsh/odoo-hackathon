-- Fix RLS policies to match actual schema (user_id instead of created_by)

-- Drop the incorrect policies first
DROP POLICY IF EXISTS "Users can view their own personal tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create personal tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own personal tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own personal tasks" ON tasks;

-- Add correct policies for personal tasks using user_id column
CREATE POLICY "Users can view their own personal tasks" ON tasks
  FOR SELECT USING (project_id IS NULL AND user_id = auth.uid());

CREATE POLICY "Users can create personal tasks" ON tasks
  FOR INSERT WITH CHECK (project_id IS NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own personal tasks" ON tasks
  FOR UPDATE USING (project_id IS NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own personal tasks" ON tasks
  FOR DELETE USING (project_id IS NULL AND user_id = auth.uid());
