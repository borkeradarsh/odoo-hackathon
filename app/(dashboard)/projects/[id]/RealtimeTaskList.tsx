'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';

import { updateTaskStatus } from '../actions';

// Real-Time Client Component
interface Task {
  id: number;
  title: string;
  status: string;
  project_id: number;
  created_at: string;
  updated_at: string;
}

interface RealtimeTaskListProps {
  projectId: number;
  initialTasks: Task[];
}

// Real-time task list component for project collaboration
export default function RealtimeTaskList({ projectId, initialTasks }: RealtimeTaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  useEffect(() => {
    const client = createClient();
    const channel = client.channel(`realtime-tasks-${projectId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'tasks', 
        filter: `project_id=eq.${projectId}` 
      }, 
      (payload: { new: Task }) => {
        setTasks(currentTasks => currentTasks.map(task => 
          task.id === payload.new.id ? payload.new : task
        ));
      })
      .subscribe();

    return () => { 
      client.removeChannel(channel); 
    };
  }, [projectId]);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      // The UI update will happen automatically via Realtime subscription
    } catch (error) {
      console.error('Failed to update task status:', error);
      // In a real app, you'd show a toast notification here
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To-Do':
        return 'text-gray-600 bg-gray-100';
      case 'In Progress':
        return 'text-yellow-600 bg-yellow-100';
      case 'Done':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No tasks found for this project</p>
        <p className="text-sm text-gray-400">
          Tasks will appear here when they are created for this project
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Updated: {new Date(task.updated_at).toLocaleDateString()}
              </div>
              <Select
                value={task.status}
                onValueChange={(newStatus) => handleStatusChange(task.id, newStatus)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To-Do">To-Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
