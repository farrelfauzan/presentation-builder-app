'use client';

import { useEffect } from 'react';

interface KeyboardListenerProps {
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

export function KeyboardListener({
  onNext,
  onPrev,
  onExit,
}: KeyboardListenerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          onPrev();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onExit]);

  return null;
}
