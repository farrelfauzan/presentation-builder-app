'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { usePresentation, useGlobalSettings } from '@/lib/hooks';
import { PresentationSlide } from '@/components/presentation/PresentationSlide';
import { PresentationControls } from '@/components/presentation/PresentationControls';
import { KeyboardListener } from '@/components/presentation/KeyboardListener';
import { Loader2 } from 'lucide-react';

interface PresentationViewProps {
  projectId: string;
}

export function PresentationView({ projectId }: PresentationViewProps) {
  const router = useRouter();

  const { data: project, isLoading: isProjectLoading } =
    usePresentation(projectId);
  const { data: globalSettings } = useGlobalSettings();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slides = project?.slides || [];

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, slides.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleExit = useCallback(() => {
    router.push(`/dashboard/projects/${projectId}`);
  }, [router, projectId]);

  // Loading state
  if (isProjectLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // No project or no slides
  if (!project || slides.length === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-900 gap-4">
        <p className="text-white/70 text-lg">
          {!project ? 'Project not found' : 'No slides to present'}
        </p>
        <button
          onClick={handleExit}
          className="text-white/50 text-sm underline hover:text-white/80"
        >
          Go back to editor
        </button>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="group/presentation relative h-screen w-screen overflow-hidden bg-gray-900 select-none">
      <KeyboardListener
        onNext={goToNext}
        onPrev={goToPrev}
        onExit={handleExit}
      />

      {/* Slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <PresentationSlide
          key={currentSlide.id}
          slide={currentSlide}
          direction={direction}
          projectTitle={project.title}
          globalSettings={globalSettings}
          isFirstSlide={currentIndex === 0}
        />
      </AnimatePresence>

      {/* Controls */}
      <PresentationControls
        currentIndex={currentIndex}
        totalSlides={slides.length}
        onPrev={goToPrev}
        onNext={goToNext}
        onExit={handleExit}
      />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <div
          className="h-full bg-white/40 transition-all duration-300 ease-out"
          style={{
            width: `${((currentIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
