'use client';

import { useState } from 'react';
import { enUS } from 'date-fns/locale';
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { createPersonalTodo, getUserProjects, scheduleMeeting } from './actions';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Meeting {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  projects?: { name: string };
}

interface Todo {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  description?: string;
  completed: boolean;
}

interface ProjectTask {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  completed: boolean;
  projects?: { name: string };
}

interface CalendarViewProps {
  meetings: Meeting[];
  todos: Todo[];
  projectTasks: ProjectTask[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'meeting' | 'todo' | 'task';
    data: Meeting | Todo | ProjectTask;
  };
}

export function CalendarView({ meetings, todos, projectTasks }: CalendarViewProps) {
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);

  // Transform data into calendar events
  const events: CalendarEvent[] = [
    // Meetings
    ...meetings.map(meeting => ({
      id: `meeting-${meeting.id}`,
      title: `📅 ${meeting.title}${meeting.projects ? ` (${meeting.projects.name})` : ''}`,
      start: new Date(meeting.start_time),
      end: new Date(meeting.end_time),
      resource: { type: 'meeting' as const, data: meeting }
    })),
    
    // Personal todos (show at their scheduled time)
    ...todos.map(todo => ({
      id: `todo-${todo.id}`,
      title: `✅ ${todo.title}${todo.completed ? ' (Completed)' : ''}`,
      start: new Date(todo.scheduled_at),
      end: new Date(new Date(todo.scheduled_at).getTime() + 60 * 60 * 1000), // 1 hour duration
      resource: { type: 'todo' as const, data: todo }
    })),
    
    // Project tasks (show at their scheduled time)
    ...projectTasks.map(task => ({
      id: `task-${task.id}`,
      title: `📋 ${task.title}${task.projects ? ` (${task.projects.name})` : ''}${task.completed ? ' (Completed)' : ''}`,
      start: new Date(task.scheduled_at),
      end: new Date(new Date(task.scheduled_at).getTime() + 60 * 60 * 1000), // 1 hour duration
      resource: { type: 'task' as const, data: task }
    }))
  ];

  // Load projects when meeting dialog opens
  const handleMeetingDialogOpen = async () => {
    const userProjects = await getUserProjects();
    setProjects(userProjects);
    setShowMeetingDialog(true);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource.type) {
      case 'meeting':
        backgroundColor = '#3b82f6'; // Blue
        break;
      case 'todo':
        backgroundColor = '#10b981'; // Green
        break;
      case 'task':
        backgroundColor = '#f59e0b'; // Orange
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleMeetingDialogOpen} className="bg-blue-600 hover:bg-blue-700">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
            <form action={scheduleMeeting} className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="projectId">Project (Optional)</Label>
                <Select name="projectId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Project</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowMeetingDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={() => setShowMeetingDialog(false)}>
                  Schedule Meeting
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              <CheckSquare className="w-4 h-4 mr-2" />
              Add Personal Todo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Personal Todo</DialogTitle>
            </DialogHeader>
            <form action={createPersonalTodo} className="space-y-4">
              <div>
                <Label htmlFor="todoTitle">Todo Title</Label>
                <Input id="todoTitle" name="title" required />
              </div>
              <div>
                <Label htmlFor="todoDescription">Description</Label>
                <Textarea id="todoDescription" name="description" />
              </div>
              <div>
                <Label htmlFor="scheduledAt">Scheduled Time</Label>
                <Input
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowTodoDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" onClick={() => setShowTodoDialog(false)}>
                  Create Todo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Meetings</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Personal Todos</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded"></div>
          <span>Project Tasks</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border p-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          popup
          onSelectEvent={(event) => {
            // Handle event selection - could show details in a modal
            console.log('Selected event:', event);
          }}
        />
      </div>
    </div>
  );
}
