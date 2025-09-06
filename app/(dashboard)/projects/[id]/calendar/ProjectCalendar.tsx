'use client';

import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { scheduleMeeting } from '../../actions';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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
  project_id: string;
  created_by: string;
}

interface ProjectCalendarProps {
  projectId: string;
  initialMeetings: Meeting[];
}

// Client Component for the calendar
export function ProjectCalendar({ projectId, initialMeetings }: ProjectCalendarProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format meetings for react-big-calendar
  const events = initialMeetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    start: new Date(meeting.start_time),
    end: new Date(meeting.end_time),
  }));

  async function handleSubmit(formData: FormData) {
    try {
      setIsSubmitting(true);
      formData.append('projectId', projectId);
      await scheduleMeeting(formData);
      setOpen(false);
      // In a real app, you'd want to refresh the data here
      window.location.reload();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Calendar</h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage project meetings
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form action={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Schedule Meeting</DialogTitle>
                <DialogDescription>
                  Create a new meeting for this project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Meeting title"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Meetings Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day']}
              defaultView="month"
              popup
              selectable
              onSelectEvent={(event: any) => {
                alert(`Meeting: ${event.title}`);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
