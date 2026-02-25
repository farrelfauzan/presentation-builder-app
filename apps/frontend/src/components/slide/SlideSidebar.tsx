'use client';

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button, ScrollArea } from '@presentation-builder-app/libs';
import { Plus } from 'lucide-react';
import { SlideSidebarItem } from './SlideSidebarItem';
import { SlideListLoading } from '../shared/LoadingState';
import type { Slide } from '../../lib/api';

interface SlideSidebarProps {
  slides: Slide[];
  activeSlideId: string | null;
  isLoading: boolean;
  onSelectSlide: (id: string) => void;
  onAddSlide: () => void;
  onReorder: (slideIds: string[]) => void;
}

export function SlideSidebar({
  slides,
  activeSlideId,
  isLoading,
  onSelectSlide,
  onAddSlide,
  onReorder,
}: SlideSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Build new order array
      const reordered = [...slides];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      onReorder(reordered.map((s) => s.id));
    },
    [slides, onReorder]
  );

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Slides</h3>
        <Button size="icon-xs" variant="outline" onClick={onAddSlide}>
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only">Add Slide</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 p-2">
        {isLoading ? (
          <SlideListLoading />
        ) : slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">No slides yet</p>
            <Button size="sm" variant="outline" onClick={onAddSlide}>
              <Plus className="mr-2 h-3.5 w-3.5" />
              Add First Slide
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slides.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1.5">
                {slides.map((slide, index) => (
                  <SlideSidebarItem
                    key={slide.id}
                    slide={slide}
                    index={index}
                    isActive={slide.id === activeSlideId}
                    onClick={() => onSelectSlide(slide.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </ScrollArea>
    </div>
  );
}
