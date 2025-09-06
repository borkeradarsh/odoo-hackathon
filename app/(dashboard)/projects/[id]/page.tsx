import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus } from 'lucide-react';
import { getProjectById, getTasksForProject } from '../actions';
import { AddTaskDialog } from './AddTaskDialog';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [project, tasks] = await Promise.all([
    getProjectById(params.id),
    getTasksForProject(params.id)
  ]);

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${params.id}/calendar`}>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </Link>
          <AddTaskDialog projectId={params.id}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </AddTaskDialog>
        </div>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({tasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tasks yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first task to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.profiles?.full_name && (
                      <p className="text-sm text-muted-foreground">
                        Assigned to: {task.profiles.full_name}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant={
                      task.status === 'Done'
                        ? 'default'
                        : task.status === 'In Progress'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
