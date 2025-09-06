// app/(dashboard)/projects/page.tsx
import { FolderOpen } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createProject, getProjectsForUser } from './actions';

export default async function ProjectsPage() {
  const projects = await getProjectsForUser();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Team Projects</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Project</DialogTitle>
            </DialogHeader>
            <form action={createProject}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter project name"
                    required
                    minLength={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogTrigger>
                <Button type="submit">Create Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardContent className="p-6">
          <Suspense fallback={<ProjectsSkeleton />}>
            {projects.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Empty for now - can add stats later */}
                    </CardContent>
                    <CardFooter>
                      <Link href={`/projects/${project.id}`} className="w-full">
                        <Button className="w-full" variant="outline">
                          View Project
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-16">
      <FolderOpen className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Get started by creating a new project to collaborate with your team.
      </p>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create New Project</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
          </DialogHeader>
          <form action={createProject}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name-empty">Project Name</Label>
                <Input
                  id="name-empty"
                  name="name"
                  type="text"
                  placeholder="Enter project name"
                  required
                  minLength={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <DialogTrigger asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogTrigger>
              <Button type="submit">Create Project</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-16"></div>
          </CardContent>
          <CardFooter>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
