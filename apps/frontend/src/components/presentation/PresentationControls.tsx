'use client';


import { Button } from '@presentation-builder-app/libs';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PresentationControlsProps {
  currentIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}

export function PresentationControls({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  onExit,
}: PresentationControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 opacity-0 hover:opacity-100 transition-opacity duration-300 group-hover/presentation:opacity-100">
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-white hover:bg-white/20"
        onClick={onPrev}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="sr-only">Previous</span>
      </Button>

      <span className="text-sm text-white/80 font-medium min-w-[4rem] text-center">
        {currentIndex + 1} / {totalSlides}
      </span>

      <Button
        variant="ghost"
        size="icon-sm"
        className="text-white hover:bg-white/20"
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
      >
        <ChevronRight className="h-5 w-5" />
        <span className="sr-only">Next</span>
      </Button>

      <div className="w-px h-5 bg-white/30" />

      <Button
        variant="ghost"
        size="icon-sm"
        className="text-white hover:bg-white/20"
        onClick={onExit}
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Exit</span>
      </Button>
    </div>
  );
}
