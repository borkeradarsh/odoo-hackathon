'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getNotifications } from '@/app/dashboard/actions';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface Todo {
  id: string;
  title: string;
  description?: string;
  scheduled_at?: string;
  created_at: string;
  completed: boolean;
}

interface NotificationDrawerProps {
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
}

export default function NotificationDrawer({
  isSheetOpen,
  setIsSheetOpen,
}: NotificationDrawerProps) {
  const [upcoming, setUpcoming] = useState<Todo[]>([]);
  const [completed, setCompleted] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSheetOpen) {
      const fetchNotifications = async () => {
        setLoading(true);
        try {
          const { upcoming: upcomingTodos, completed: completedTodos } =
            await getNotifications();
          setUpcoming(upcomingTodos || []);
          setCompleted(completedTodos || []);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchNotifications();
    }
  }, [isSheetOpen]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="mt-2 text-center text-lg font-bold">
            All Notifications
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : (
            <>
              {/* Upcoming Section */}
              <div>
                <h3 className="text-md mb-4 pl-3 font-semibold">Upcoming</h3>
                {upcoming.length === 0 ? (
                  <p className="px-4 text-sm text-gray-500">
                    No upcoming tasks
                  </p>
                ) : (
                  <div className="space-y-3 px-4">
                    {upcoming.map((todo) => (
                      <div
                        key={todo.id}
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="font-medium text-gray-900">
                            {todo.title}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            Upcoming
                          </Badge>
                        </div>
                        {todo.description && (
                          <p className="mb-2 text-sm text-gray-600">
                            {todo.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {todo.scheduled_at
                            ? formatTime(todo.scheduled_at)
                            : formatTime(todo.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Section */}
              <div>
                <h3 className="text-md mb-4 pl-3 font-semibold">Completed</h3>
                {completed.length === 0 ? (
                  <p className="px-4 text-sm text-gray-500">
                    No recently completed tasks
                  </p>
                ) : (
                  <div className="space-y-3 px-4">
                    {completed.map((todo) => (
                      <div
                        key={todo.id}
                        className="rounded-lg border border-green-200 bg-green-50 p-3"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="font-medium text-gray-900">
                            {todo.title}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            Completed
                          </Badge>
                        </div>
                        {todo.description && (
                          <p className="mb-2 text-sm text-gray-600">
                            {todo.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatTime(todo.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
