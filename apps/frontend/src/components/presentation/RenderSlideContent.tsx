import type { Slide } from '@/lib/api';

interface RenderSlideContentProps {
  slide: Slide;
  hasText: boolean;
  hasMedia: boolean;
}

export function RenderSlideContent({
  slide,
  hasText,
  hasMedia,
}: RenderSlideContentProps) {
  if (hasText && !hasMedia) {
    return (
      <div className="flex items-center justify-center w-full h-full px-16">
        <p className="text-xl font-medium text-white leading-relaxed text-center whitespace-pre-wrap max-w-3xl">
          {slide.textContent}
        </p>
      </div>
    );
  }

  if (!hasText && hasMedia) {
    return (
      <div className="flex items-center justify-center w-full h-full p-6">
        {slide.mediaType === 'video' ? (
          <video
            src={slide.mediaUrl!}
            controls
            autoPlay
            className="max-h-[70vh] max-w-[80%] rounded-lg object-contain"
          />
        ) : (
          <img
            src={slide.mediaUrl!}
            alt="Slide"
            className="max-h-[70vh] max-w-[80%] rounded-lg object-contain"
          />
        )}
      </div>
    );
  }

  if (hasText && hasMedia) {
    return (
      <div className="flex items-stretch w-full h-full">
        <div className="flex w-1/2 items-center justify-center px-8">
          <p className="text-lg font-medium text-white leading-relaxed whitespace-pre-wrap">
            {slide.textContent}
          </p>
        </div>
        <div className="flex w-1/2 items-center justify-center p-4">
          {slide.mediaType === 'video' ? (
            <video
              src={slide.mediaUrl!}
              controls
              className="max-h-[65vh] max-w-full rounded-lg object-contain"
            />
          ) : (
            <img
              src={slide.mediaUrl!}
              alt="Slide"
              className="max-h-[65vh] max-w-full rounded-lg object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
