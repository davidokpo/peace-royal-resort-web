import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const getMediaType = (src = '') => {
  const normalized = src.toLowerCase();
  if (normalized.endsWith('.mp4') || normalized.endsWith('.mov') || normalized.endsWith('.webm')) {
    return 'video';
  }
  return 'image';
};

const MediaSlideshow = ({
  items,
  className = '',
  overlayClassName = '',
  showDots = true,
  autoPlay = true,
}) => {
  const slides = useMemo(() => items.filter(Boolean), [items]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) {
      return undefined;
    }

    const activeSlide = slides[activeIndex];
    const timeoutMs = getMediaType(activeSlide?.src) === 'video' ? 8000 : 5000;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, timeoutMs);

    return () => window.clearTimeout(timer);
  }, [activeIndex, autoPlay, slides]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];
  const mediaType = getMediaType(activeSlide.src);

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {mediaType === 'video' ? (
        <video
          key={activeSlide.src}
          src={activeSlide.src}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          key={activeSlide.src}
          src={activeSlide.src}
          alt={activeSlide.alt}
          className="h-full w-full object-cover"
        />
      )}

      {overlayClassName ? <div className={`absolute inset-0 ${overlayClassName}`}></div> : null}

      {slides.length > 1 ? (
        <>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border-white/40 bg-black/35 text-white hover:bg-black/55"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border-white/40 bg-black/35 text-white hover:bg-black/55"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      ) : null}

      {showDots && slides.length > 1 ? (
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
          {slides.map((slide, index) => (
            <button
              key={`${slide.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                index === activeIndex ? 'bg-white' : 'bg-white/45'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default MediaSlideshow;
