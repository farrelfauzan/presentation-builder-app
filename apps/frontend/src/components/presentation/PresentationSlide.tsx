'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { Slide, GlobalSettings } from '@/lib/api';

interface PresentationSlideProps {
  slide: Slide;
  direction: number; // 1 = forward, -1 = backward
  projectTitle?: string;
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
      className="absolute inset-0 flex items-center justify-center"
    >
      {/* First slide: show project info + settings */}
      {isFirstSlide && (
        <div className="absolute top-8 left-8 right-8 flex items-start justify-between">
          {globalSettings?.logoUrl && (
            <img
              src={globalSettings.logoUrl}
              alt={globalSettings.companyName || 'Logo'}
              className="h-12 w-auto object-contain"
            />
          )}
          {globalSettings?.companyName && (
            <span className="text-sm text-white/60 font-medium">
              {globalSettings.companyName}
            </span>
          )}
        </div>
      )}

      {/* Content rendering based on layout logic */}
      {renderSlideContent(slide, hasText, hasMedia)}

      {/* First slide project title overlay */}
      {isFirstSlide && projectTitle && !hasText && !hasMedia && (
        <div className="text-center px-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {projectTitle}
          </h1>
          {globalSettings?.companyName && (
            <p className="text-xl text-white/70">{globalSettings.companyName}</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function renderSlideContent(
  slide: Slide,
  hasText: boolean,
  hasMedia: boolean
) {
  // Text only
  if (hasText && !hasMedia) {
    return (
      <div className="flex items-center justify-center w-full h-full px-16">
        <p className="text-3xl font-medium text-white leading-relaxed text-center whitespace-pre-wrap max-w-4xl">
          {slide.textContent}
        </p>
      </div>
    );
  }

  // Media only
  if (!hasText && hasMedia) {
    return (
      <div className="flex items-center justify-center w-full h-full p-8">
        {slide.mediaType === 'video' ? (
          <video
            src={slide.mediaUrl!}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        ) : (
          <img
            src={slide.mediaUrl!}
            alt="Slide"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
      </div>
    );
  }

  // Text + Media (split)
  if (hasText && hasMedia) {
    return (
      <div className="flex items-stretch w-full h-full">
        <div className="flex w-1/2 items-center justify-center px-12">
          <p className="text-2xl font-medium text-white leading-relaxed whitespace-pre-wrap">
            {slide.textContent}
          </p>
        </div>
        <div className="flex w-1/2 items-center justify-center p-8">
          {slide.mediaType === 'video' ? (
            <video
              src={slide.mediaUrl!}
              controls
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          ) : (
            <img
              src={slide.mediaUrl!}
              alt="Slide"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}
