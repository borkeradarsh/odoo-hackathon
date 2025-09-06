// app/(dashboard)/calendar/page.tsx
import { getPersonalCalendarData } from './actions';
import { CalendarView } from './CalendarView';

export default async function CalendarPage() {
  const calendarData = await getPersonalCalendarData();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View all your meetings, personal todos, and project tasks
        </p>
      </div>
      
      <CalendarView 
        meetings={calendarData.meetings}
        todos={calendarData.todos}
        projectTasks={calendarData.projectTasks}
      />
    </div>
  );
}
