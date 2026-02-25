'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
} from '@presentation-builder-app/libs';
import { toast } from 'sonner';
import { useUpdateProject } from '../../lib/hooks';
import type { Project } from '../../lib/api';
import { Loader2, Save } from 'lucide-react';

interface EditProjectDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');

  const updateProject = useUpdateProject();

  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
      setVersion(project.version || '');
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          title: title.trim(),
          description: description.trim() || undefined,
          version: version.trim() || undefined,
        },
      });
      toast.success('Project updated successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="My Presentation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Brief description of this presentation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                placeholder="1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
