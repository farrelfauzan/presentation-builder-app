'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@presentation-builder-app/libs';
import { GripVertical, Image, Type, FileText } from 'lucide-react';
import type { Slide } from '../../lib/api';

interface SlideSidebarItemProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

function getSlideIcon(slide: Slide) {
  if (slide.textContent && slide.mediaUrl) return FileText;
  if (slide.mediaUrl) return Image;
  return Type;
}

function getSlideLabel(slide: Slide) {
  if (slide.textContent) {
    return slide.textContent.length > 30
      ? slide.textContent.slice(0, 30) + '...'
      : slide.textContent;
  }
  if (slide.mediaUrl) return 'Media Slide';
  return 'Empty Slide';
}

export function SlideSidebarItem({
  slide,
  index,
  isActive,
  onClick,
}: SlideSidebarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = getSlideIcon(slide);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer transition-colors',
        isActive
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:bg-accent',
        isDragging && 'opacity-50'
      )}
      onClick={onClick}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {index + 1}
        </span>
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-sm truncate">{getSlideLabel(slide)}</span>
      </div>
    </div>
  );
}
