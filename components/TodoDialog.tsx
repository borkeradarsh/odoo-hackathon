'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const todoSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  due_date: z.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      return date >= today;
    },
    {
      message: 'Due date cannot be in the past.',
    }
  ),
  due_time: z.string().min(1, 'Due time is required.'),
});
import { CalendarIcon, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

// Pretty Time Picker Component
function PrettyTimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');

  // Parse current value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      const hour24 = parseInt(h, 10);
      const minute = parseInt(m, 10);

      if (hour24 === 0) {
        setSelectedHour('12');
        setSelectedPeriod('AM');
      } else if (hour24 < 12) {
        setSelectedHour(hour24.toString());
        setSelectedPeriod('AM');
      } else if (hour24 === 12) {
        setSelectedHour('12');
        setSelectedPeriod('PM');
      } else {
        setSelectedHour((hour24 - 12).toString());
        setSelectedPeriod('PM');
      }

      setSelectedMinute(minute.toString().padStart(2, '0'));
    }
  }, [value]);

  const handleApply = () => {
    let hour24 = parseInt(selectedHour, 10);

    if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }

    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  const displayTime = value
    ? (() => {
        const [h, m] = value.split(':');
        const hour24 = parseInt(h, 10);
        const displayHour =
          hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const displayPeriod = hour24 < 12 ? 'AM' : 'PM';
        return `${displayHour}:${m} ${displayPeriod}`;
      })()
    : 'Select time';

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'h-10 w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground'
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="space-y-4 p-6">
          <div className="text-center">
            <h4 className="font-medium text-gray-900">Select Time</h4>
            <p className="mt-1 text-sm text-gray-500">
              Choose your preferred time
            </p>
          </div>

          {/* Time Display */}
          <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <div className="text-center text-2xl font-bold text-gray-800">
              {selectedHour}:{selectedMinute} {selectedPeriod}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Hours */}
            <div>
              <label className="mb-2 block text-center text-sm font-medium text-gray-700">
                Hour
              </label>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 12 }, (_, i) => {
                  const hour = (i + 1).toString();
                  return (
                    <Button
                      key={hour}
                      size="sm"
                      variant={selectedHour === hour ? 'default' : 'outline'}
                      className={cn(
                        'h-8 text-xs transition-all',
                        selectedHour === hour
                          ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                          : 'hover:border-green-300 hover:bg-green-50'
                      )}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Minutes */}
            <div>
              <label className="mb-2 block text-center text-sm font-medium text-gray-700">
                Minute
              </label>
              <div className="grid grid-cols-3 gap-1">
                {['00', '15', '30', '45'].map((minute) => (
                  <Button
                    key={minute}
                    size="sm"
                    variant={selectedMinute === minute ? 'default' : 'outline'}
                    className={cn(
                      'h-8 text-xs transition-all',
                      selectedMinute === minute
                        ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                        : 'hover:border-green-300 hover:bg-green-50'
                    )}
                    onClick={() => setSelectedMinute(minute)}
                  >
                    {minute}
                  </Button>
                ))}
              </div>
            </div>

            {/* AM/PM */}
            <div>
              <label className="mb-2 block text-center text-sm font-medium text-gray-700">
                Period
              </label>
              <div className="space-y-1">
                {['AM', 'PM'].map((period) => (
                  <Button
                    key={period}
                    size="sm"
                    variant={selectedPeriod === period ? 'default' : 'outline'}
                    className={cn(
                      'h-8 w-full text-xs transition-all',
                      selectedPeriod === period
                        ? 'bg-green-500 text-white shadow-sm hover:bg-green-600'
                        : 'hover:border-green-300 hover:bg-green-50'
                    )}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 border-t border-gray-100 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Apply Time
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type TodoFormData = z.infer<typeof todoSchema>;

interface Todo {
  id: string;
  title: string;
  description?: string | null;
  scheduled_at?: string | null;
}

interface TodoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => Promise<any>;
  todo?: Todo | null;
}

export function TodoDialog({
  isOpen,
  setIsOpen,
  action,
  todo,
}: TodoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: new Date(),
      due_time: '',
    },
  });

  // Reset form when dialog opens/closes or todo changes
  useEffect(() => {
    if (isOpen) {
      if (todo) {
        // Editing mode - populate form with existing data
        const todoDate = todo.scheduled_at
          ? new Date(todo.scheduled_at)
          : new Date();
        const timeString = todo.scheduled_at
          ? format(new Date(todo.scheduled_at), 'HH:mm')
          : format(new Date(), 'HH:mm');

        form.reset({
          title: todo.title,
          description: todo.description || '',
          due_date: todoDate,
          due_time: timeString,
        });
      } else {
        // Creating mode - reset to defaults
        form.reset({
          title: '',
          description: '',
          due_date: new Date(),
          due_time: format(new Date(), 'HH:mm'),
        });
      }
    }
  }, [isOpen, todo, form]);

  const onSubmit = async (data: TodoFormData) => {
    setIsSubmitting(true);

    try {
      // Combine date and time into a single datetime
      const [hours, minutes] = data.due_time.split(':');

      // Create a clean date without time components
      const combinedDateTime = new Date(data.due_date);
      combinedDateTime.setHours(parseInt(hours, 10));
      combinedDateTime.setMinutes(parseInt(minutes, 10));
      combinedDateTime.setSeconds(0);
      combinedDateTime.setMilliseconds(0);

      // Check if the combined datetime is in the past
      const now = new Date();

      if (combinedDateTime <= now) {
        form.setError('due_time', {
          message: 'Due time must be in the future.',
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      formData.append('due_date', combinedDateTime.toISOString());

      // If editing, include the todo ID
      if (todo) {
        formData.append('id', todo.id);
      }

      const result = await action(formData);

      if (result?.success) {
        setIsOpen(false);
        form.reset();
      } else if (result?.error) {
        // Handle validation errors
        if (result.error.title) {
          form.setError('title', { message: result.error.title[0] });
        }
        if (result.error.description) {
          form.setError('description', {
            message: result.error.description[0],
          });
        }
        if (result.error.due_date) {
          form.setError('due_date', { message: result.error.due_date[0] });
        }
        if (result.error.database) {
          const errorMessage = Array.isArray(result.error.database)
            ? result.error.database[0]
            : result.error.database;
          form.setError('root', { message: errorMessage });
        }
      }
    } catch {
      form.setError('root', { message: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl sm:max-w-[500px]">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {todo ? 'Edit Todo' : 'Add Todo'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-4"
          >
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Title *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter todo title"
                      className="mt-1 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter todo description"
                      className="mt-1 min-h-[100px] resize-none focus:border-green-500 focus:ring-2 focus:ring-green-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Due Date Field */}
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Due Date *
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'mt-1 w-full justify-start text-left font-normal focus:border-green-500 focus:ring-2 focus:ring-green-500',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Choose Due Date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Due Time Field */}
            <FormField
              control={form.control}
              name="due_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Due Time *
                  </FormLabel>
                  <FormControl>
                    <PrettyTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500" />
                </FormItem>
              )}
            />

            {/* Form Error */}
            {form.formState.errors.root && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="border-gray-300 px-6 py-2 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-500 px-6 py-2 font-medium text-white hover:bg-green-600"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    {todo ? 'Updating...' : 'Creating...'}
                  </div>
                ) : todo ? (
                  'Update Todo'
                ) : (
                  'Create Todo'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
