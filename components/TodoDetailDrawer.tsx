'use client';

import { format } from 'date-fns';
import { Calendar, Pencil, Save, Trash2, X } from 'lucide-react';
import React, { useEffect, useState, useTransition } from 'react';

import { deleteTodo, updateTodo } from '@/app/dashboard/actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { Todo } from '@/lib/types/database';

interface TodoDetailDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  todo: Todo | null;
  onTodoUpdate?: () => void;
}

export default function TodoDetailDrawer({
  isOpen,
  setIsOpen,
  todo,
  onTodoUpdate,
}: TodoDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  // Initialize edit fields when todo changes or when entering edit mode
  useEffect(() => {
    if (todo) {
      setEditTitle(todo.title);
      setEditDescription(todo.description || '');
    }
  }, [todo]);

  const handleSaveEdit = async () => {
    if (!todo) return;

    const formData = new FormData();
    formData.append('id', todo.id);
    formData.append('title', editTitle);
    formData.append('description', editDescription);
    formData.append('due_date', todo.scheduled_at || new Date().toISOString());

    startTransition(async () => {
      try {
        await updateTodo(formData);
        setIsEditing(false);
        onTodoUpdate?.();
      } catch (error) {
        console.error('Failed to update todo:', error);
      }
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo?.title || '');
    setEditDescription(todo?.description || '');
  };

  if (!todo) return null;

  const handleDelete = async () => {
    if (!todo) return;

    try {
      await deleteTodo(todo.id);
      setIsOpen(false);
      onTodoUpdate?.();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-center text-lg font-bold">
            Todo Details
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Title */}
          <div>
            {isEditing ? (
              <div className="space-y-2 px-6">
                <label className="text-sm font-medium text-gray-700">
                  Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Todo title"
                  className="w-full"
                />
              </div>
            ) : (
              <h2 className="mb-4 px-6 text-xl font-semibold text-gray-900">
                {todo.title}
              </h2>
            )}
          </div>

          {/* Due Date */}
          <div className="flex items-center space-x-2 px-6 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Due Date</span>
            <span className="ml-5">
              {todo.scheduled_at
                ? formatDate(todo.scheduled_at)
                : 'No scheduled date'}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <span className="px-6 text-sm font-medium text-gray-600">
              Status
            </span>
            <Badge
              variant={todo.completed ? 'default' : 'secondary'}
              className={
                todo.completed
                  ? 'border-green-200 bg-green-100 text-green-800'
                  : 'border-yellow-200 bg-yellow-100 text-yellow-800'
              }
            >
              {todo.completed ? 'Completed' : 'Upcoming'}
            </Badge>
          </div>

          {/* Description */}
          <div className="space-y-2 px-6">
            <h3 className="text-sm font-medium text-gray-900">Description</h3>
            {isEditing ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Todo description"
                className="min-h-[100px] w-full"
              />
            ) : (
              <p className="text-sm leading-relaxed text-gray-600">
                {todo.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 px-6 pt-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isPending || !editTitle.trim()}
                  size="sm"
                  className="flex items-center space-x-2 bg-green-500 text-white hover:bg-green-600"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center space-x-2 text-red-600 hover:border-red-300 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
