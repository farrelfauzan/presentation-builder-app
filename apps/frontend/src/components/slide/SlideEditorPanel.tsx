'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Button,
  Label,
  Textarea,
  Separator,
} from '@presentation-builder-app/libs';
import { toast } from 'sonner';
import { Upload, X, Save, Trash2, Loader2 } from 'lucide-react';
import { useUpdateSlide, useDeleteSlide, useUploadMedia } from '../../lib/hooks';
import type { Slide } from '../../lib/api';

interface SlideEditorPanelProps {
  slide: Slide | null;
  projectId: string;
  onSlideDeleted: () => void;
}

export function SlideEditorPanel({
  slide,
  projectId,
  onSlideDeleted,
}: SlideEditorPanelProps) {
  const [textContent, setTextContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSlide = useUpdateSlide(projectId);
  const deleteSlide = useDeleteSlide(projectId);
  const uploadMedia = useUploadMedia();

  // Sync state when active slide changes
  useEffect(() => {
    if (slide) {
      setTextContent(slide.textContent || '');
      setMediaUrl(slide.mediaUrl);
      setMediaType(slide.mediaType);
      setIsDirty(false);
    }
  }, [slide]);

  if (!slide) {
    return (
      <div className="flex h-full w-80 shrink-0 items-center justify-center border-l bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Select a slide to edit
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateSlide.mutateAsync({
        id: slide.id,
        data: {
          textContent: textContent || undefined,
          mediaUrl: mediaUrl || undefined,
          mediaType: mediaType || undefined,
        },
      });
      setIsDirty(false);
      toast.success('Slide saved');
    } catch {
      toast.error('Failed to save slide');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMedia.mutateAsync(file);
      setMediaUrl(result.url);
      setMediaType(result.mediaType as 'image' | 'video');
      setIsDirty(true);
      toast.success('Media uploaded');
    } catch {
      toast.error('Failed to upload media');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    setIsDirty(true);
  };

  const handleDelete = async () => {
    try {
      await deleteSlide.mutateAsync(slide.id);
      toast.success('Slide deleted');
      onSlideDeleted();
    } catch {
      toast.error('Failed to delete slide');
    }
  };

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Slide Editor</h3>
        <span className="text-xs text-muted-foreground">
          Slide #{slide.order + 1}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Text Content */}
        <div className="space-y-2">
          <Label htmlFor="slide-text">Text Content</Label>
          <Textarea
            id="slide-text"
            placeholder="Enter slide text..."
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              setIsDirty(true);
            }}
            rows={6}
            className="resize-none"
          />
        </div>

        <Separator />

        {/* Media Upload */}
        <div className="space-y-2">
          <Label>Media</Label>

          {mediaUrl ? (
            <div className="space-y-2">
              <div className="relative rounded-md border overflow-hidden">
                {mediaType === 'video' ? (
                  <video
                    src={mediaUrl}
                    controls
                    className="w-full max-h-40 object-cover"
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Slide media"
                    className="w-full max-h-40 object-cover"
                  />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleRemoveMedia}
              >
                <X className="mr-2 h-3.5 w-3.5" />
                Remove Media
              </Button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadMedia.isPending}
              >
                {uploadMedia.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-3.5 w-3.5" />
                )}
                Upload Media
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 space-y-2">
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!isDirty || updateSlide.isPending}
        >
          {updateSlide.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Changes
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={handleDelete}
          disabled={deleteSlide.isPending}
        >
          {deleteSlide.isPending ? (
            <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-3.5 w-3.5" />
          )}
          Delete Slide
        </Button>
      </div>
    </div>
  );
}
