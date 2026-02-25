'use client';

import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@presentation-builder-app/libs';
import {
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
  Play,
} from 'lucide-react';
import type { Project } from '../../lib/api';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="group relative flex flex-col">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 pr-8">
          <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
            {project.title}
          </CardTitle>
          {project.version && (
            <span className="text-xs text-muted-foreground">
              v{project.version}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(project)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="flex-1">
        <CardDescription className="line-clamp-2 text-sm">
          {project.description || 'No description'}
        </CardDescription>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        <Button asChild variant="default" size="sm" className="flex-1">
          <Link href={`/dashboard/projects/${project.id}`}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Open
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link href={`/presentation/${project.id}`}>
            <Play className="mr-2 h-4 w-4" />
            Present
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
