'use client';

import { cn } from '@presentation-builder-app/libs';
import { Type, Image as ImageIcon } from 'lucide-react';
import type { Slide } from '@/lib/api';

interface SlideCanvasProps {
  slide: Slide | null;
}

export function SlideCanvas({ slide }: SlideCanvasProps) {
  if (!slide) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <Type className="mx-auto h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Select a slide to preview</p>
        </div>
      </div>
    );
  }

  const hasText = !!slide.textContent;
  const hasMedia = !!slide.mediaUrl;

  // Case 1: Only Text
  if (hasText && !hasMedia) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <div className="max-w-2xl text-center">
          <p className="text-2xl font-medium leading-relaxed whitespace-pre-wrap">
            {slide.textContent}
          </p>
        </div>
      </div>
    );
  }

  // Case 2: Only Media
  if (!hasText && hasMedia) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black/5 p-4">
        {slide.mediaType === 'video' ? (
          <video
            src={slide.mediaUrl!}
            controls
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <img
            src={slide.mediaUrl!}
            alt="Slide media"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    );
  }

  // Case 3: Text + Media (Split View)
  if (hasText && hasMedia) {
    return (
      <div className="flex flex-1 items-stretch bg-background">
        {/* Left: Text */}
        <div className="flex w-1/2 items-center justify-center border-r p-8">
          <p className="text-lg font-medium leading-relaxed whitespace-pre-wrap">
            {slide.textContent}
          </p>
        </div>

        {/* Right: Media */}
        <div className="flex w-1/2 items-center justify-center bg-black/5 p-4">
          {slide.mediaType === 'video' ? (
            <video
              src={slide.mediaUrl!}
              controls
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : (
            <img
              src={slide.mediaUrl!}
              alt="Slide media"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  // Empty slide
  return (
    <div className="flex flex-1 items-center justify-center bg-muted/20">
      <div className="text-center text-muted-foreground">
        <div className="flex items-center gap-4 mb-3 opacity-30">
          <Type className="h-10 w-10" />
          <ImageIcon className="h-10 w-10" />
        </div>
        <p className="text-sm">Add text or media to this slide</p>
      </div>
    </div>
  );
}
