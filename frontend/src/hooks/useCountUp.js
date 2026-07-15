import { useState, useEffect } from 'react';

// ponytail: cap at 400ms regardless of what callers pass — DESIGN.md caps
// product motion at 150-250ms; a KPI counter is decorative, not core motion,
// so 400ms (--anim-duration-slow) is the ceiling, not the raw caller value.
const MAX_DURATION_MS = 400;

export default function useCountUp(endValue, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const endVal = parseFloat(endValue) || 0;

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      setValue(endVal);
      return;
    }

    let startTime = null;
    let animationFrame;

    const startVal = 0;
    const cappedDuration = Math.min(duration, MAX_DURATION_MS);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / cappedDuration, 1);
      
      // easeOutExpo easing
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setValue(startVal + (endVal - startVal) * easeProgress);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setValue(endVal);
      }
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [endValue, duration]);

  return value;
}
