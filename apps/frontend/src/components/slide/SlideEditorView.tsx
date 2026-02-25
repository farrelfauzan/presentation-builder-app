'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@presentation-builder-app/libs';
import { ArrowLeft, Play } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useProject,
  useSlides,
  useCreateSlide,
  useReorderSlides,
} from '@/lib/hooks';
import { SlideSidebar } from '@/components/slide/SlideSidebar';
import { SlideCanvas } from '@/components/slide/SlideCanvas';
import { SlideEditorPanel } from '@/components/slide/SlideEditorPanel';
import { EditorLoading } from '@/components/shared/LoadingState';
import type { Slide } from '@/lib/api';

interface SlideEditorViewProps {
  projectId: string;
}

export function SlideEditorView({ projectId }: SlideEditorViewProps) {
  const router = useRouter();

  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const { data: slides = [], isLoading: isSlidesLoading } = useSlides(projectId);
  const createSlide = useCreateSlide(projectId);
  const reorderSlides = useReorderSlides(projectId);

  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);

  // Auto-select first slide when slides load
  useEffect(() => {
    if (slides.length > 0 && !activeSlideId) {
      setActiveSlideId(slides[0].id);
    }
  }, [slides, activeSlideId]);

  const activeSlide = slides.find((s) => s.id === activeSlideId) || null;

  const handleAddSlide = useCallback(async () => {
    try {
      const newSlide = await createSlide.mutateAsync({
        order: slides.length,
      });
      setActiveSlideId(newSlide.id);
      toast.success('Slide added');
    } catch {
      toast.error('Failed to add slide');
    }
  }, [createSlide, slides.length]);

  const handleReorder = useCallback(
    async (slideIds: string[]) => {
      try {
        await reorderSlides.mutateAsync({ slideIds });
      } catch {
        toast.error('Failed to reorder slides');
      }
    },
    [reorderSlides]
  );

  const handleSlideDeleted = useCallback(() => {
    // Select next available slide
    const remainingSlides = slides.filter((s) => s.id !== activeSlideId);
    if (remainingSlides.length > 0) {
      setActiveSlideId(remainingSlides[0].id);
    } else {
      setActiveSlideId(null);
    }
  }, [slides, activeSlideId]);

  if (isProjectLoading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <EditorLoading />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{project.title}</h2>
            {project.version && (
              <span className="text-xs text-muted-foreground">
                v{project.version}
              </span>
            )}
          </div>
        </div>
        <Button asChild size="sm">
          <Link href={`/presentation/${projectId}`}>
            <Play className="mr-2 h-4 w-4" />
            Present
          </Link>
        </Button>
      </div>

      {/* Editor Layout: Sidebar | Canvas | Editor Panel */}
      <div className="flex flex-1 overflow-hidden">
        <SlideSidebar
          slides={slides}
          activeSlideId={activeSlideId}
          isLoading={isSlidesLoading}
          onSelectSlide={setActiveSlideId}
          onAddSlide={handleAddSlide}
          onReorder={handleReorder}
        />

        <SlideCanvas slide={activeSlide} />

        <SlideEditorPanel
          slide={activeSlide}
          projectId={projectId}
          onSlideDeleted={handleSlideDeleted}
        />
      </div>
    </div>
  );
}
