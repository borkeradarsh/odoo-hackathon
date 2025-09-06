import React from 'react';
import { getMeetingsForProject } from '../../actions';
import { ProjectCalendar } from './ProjectCalendar';

interface CalendarPageProps {
  params: {
    id: string;
  };
}

// Server Component to fetch meetings
export default async function CalendarPage({ params }: CalendarPageProps) {
  const meetings = await getMeetingsForProject(params.id);
  
  return (
    <div className="container mx-auto p-6">
      <ProjectCalendar projectId={params.id} initialMeetings={meetings || []} />
    </div>
  );
}
