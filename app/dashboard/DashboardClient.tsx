// app/dashboard/DashboardClient.tsx
'use client';

import { motion } from 'framer-motion';
import { Filter, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';

import TodoDetailDrawer from '@/components/TodoDetailDrawer';
import { TodoDialog } from '@/components/TodoDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Todo } from '@/lib/types/database';

import { addTodo, deleteTodo, toggleTodoStatus, updateTodo } from './actions';

interface DashboardClientProps {
  initialTodos: Todo[];
  userName: string;
}

export default function DashboardClient({
  initialTodos,
  userName,
}: DashboardClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  // Wrapper functions to normalize action return types
  const addTodoWrapper = async (formData: FormData) => {
    const result = await addTodo(formData);
    return result;
  };

  const updateTodoWrapper = async (formData: FormData) => {
    const result = await updateTodo(formData);
    return result;
  };

  // Calculate statistics
  const totalTodos = initialTodos.length;
  const upcomingTodos = initialTodos.filter(
    (todo) =>
      !todo.completed &&
      todo.scheduled_at &&
      new Date(todo.scheduled_at) > new Date()
  ).length;
  const completedTodos = initialTodos.filter((todo) => todo.completed).length;

  const handleAddTodo = () => {
    setEditingTodo(null);
    setIsDialogOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setIsDialogOpen(true);
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (confirm('Are you sure you want to delete this todo?')) {
      try {
        const result = await deleteTodo(todoId);
        if (result?.error) {
          alert('Failed to delete todo. Please try again.');
        }
      } catch {
        alert('An error occurred while deleting the todo.');
      }
    }
  };

  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDetailOpen(true);
  };

  const handleTodoUpdate = () => {
    // Force a page refresh to get updated data
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Hello, {userName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Last Login Time:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-soft transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">All Todos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTodos}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-soft bg-amber-200 transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingTodos}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="shadow-soft bg-green-200 transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTodos}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Todos Table */}
      <Card className="shadow-soft transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Todos</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </motion.div>
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <Button
                  size="sm"
                  className="hover:shadow-glow bg-green-500 transition-all hover:bg-green-600"
                  onClick={handleAddTodo}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Todo
                </Button>
              </motion.div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {initialTodos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="mb-4 text-gray-500">No todos found</p>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button onClick={handleAddTodo}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first todo
                </Button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <Table>
                <TableHeader>
                  <TableRow className="rounded-2xl bg-gray-200 hover:bg-gray-200">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Todo</TableHead>
                    <TableHead className="w-32">Due Date</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-24 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialTodos.map((todo) => (
                    <motion.tr
                      key={todo.id}
                      variants={itemVariants}
                      className="cursor-pointer border-b transition-colors hover:bg-gray-50"
                      onClick={() => handleTodoClick(todo)}
                      whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <TodoStatusCheckbox todo={todo} />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {todo.title}
                          </div>
                          {todo.description && (
                            <div className="mt-1 text-sm text-gray-500">
                              {todo.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {todo.scheduled_at
                            ? formatDate(todo.scheduled_at)
                            : 'No scheduled date'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={todo.completed ? 'default' : 'secondary'}
                          className={
                            todo.completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {todo.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTodo(todo);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTodo(todo.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Todo Dialog */}
      <TodoDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        action={editingTodo ? updateTodoWrapper : addTodoWrapper}
        todo={editingTodo}
      />

      {/* Todo Detail Drawer */}
      <TodoDetailDrawer
        isOpen={isDetailOpen}
        setIsOpen={setIsDetailOpen}
        todo={selectedTodo}
        onTodoUpdate={handleTodoUpdate}
      />
    </div>
  );
}

// TodoStatusCheckbox Component
interface TodoStatusCheckboxProps {
  todo: Todo;
}

function TodoStatusCheckbox({ todo }: TodoStatusCheckboxProps) {
  const [isPending, startTransition] = useTransition();

  const handleCheckedChange = () => {
    startTransition(async () => {
      await toggleTodoStatus(todo.id, todo.completed);
    });
  };

  return (
    <Checkbox
      checked={todo.completed}
      onCheckedChange={handleCheckedChange}
      disabled={isPending}
      className={`h-4 w-4 border-black ${
        todo.completed ? 'bg-green-500' : 'bg-green-200'
      }`}
    />
  );
}
