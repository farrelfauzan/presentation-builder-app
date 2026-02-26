'use client';

import { motion } from 'motion/react';
import type { Slide, GlobalSettings } from '@/lib/api';
import { RenderSlideContent } from './RenderSlideContent';

interface PresentationSlideProps {
  slide: Slide;
  direction: number;
  projectTitle?: string;
  projectDescription?: string | null;
  projectVersion?: string | null;
  globalSettings?: GlobalSettings | null;
  isFirstSlide?: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const transition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

export function PresentationSlide({
  slide,
  direction,
  projectTitle,
  projectDescription,
  projectVersion,
  globalSettings,
  isFirstSlide,
}: PresentationSlideProps) {
  const hasText = !!slide.textContent;
  const hasMedia = !!slide.mediaUrl;

  return (
    <motion.div
      key={slide.id}
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transition}
      className="absolute inset-0 flex flex-col"
    >
      {isFirstSlide && (
        <div className="shrink-0 px-8 pt-8">
          <div className="flex flex-row items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {globalSettings?.logoUrl && (
                <img
                  src={globalSettings.logoUrl}
                  alt={globalSettings.companyName || 'Logo'}
                  className="h-12 w-auto object-contain"
                />
              )}
              {globalSettings?.companyName && (
                <span className="text-sm text-white/80 font-semibold truncate">
                  {globalSettings.companyName}
                </span>
              )}
            </div>

            <div className="flex flex-row items-center gap-3 text-sm text-white/60">
              {globalSettings?.address && (
                <span>{globalSettings.address}</span>
              )}
              {globalSettings?.address && (globalSettings?.email || globalSettings?.website) && (
                <span>•</span>
              )}
              {globalSettings?.email && (
                <a
                  href={`mailto:${globalSettings.email}`}
                  className="hover:text-white/90 underline transition-colors"
                >
                  {globalSettings.email}
                </a>
              )}
              {globalSettings?.email && globalSettings?.website && (
                <span>•</span>
              )}
              {globalSettings?.website && (
                <a
                  href={
                    globalSettings.website.startsWith('http')
                      ? globalSettings.website
                      : `https://${globalSettings.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white/90 underline transition-colors"
                >
                  {globalSettings.website}
                </a>
              )}
            </div>
          </div>

          <div className="text-center border-t border-white/10 pt-4">
            {projectTitle && (
              <h1 className="text-3xl font-bold text-white mb-1">
                {projectTitle}
              </h1>
            )}
            <div className="flex items-center justify-center gap-3">
              {projectDescription && (
                <p className="text-sm text-white/60 max-w-2xl">
                  {projectDescription}
                </p>
              )}
              {projectVersion && (
                <span className="inline-block text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                  v{projectVersion}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center relative min-h-0 overflow-hidden">
        <RenderSlideContent slide={slide} hasText={hasText} hasMedia={hasMedia} />
      </div>
    </motion.div>
  );
}
