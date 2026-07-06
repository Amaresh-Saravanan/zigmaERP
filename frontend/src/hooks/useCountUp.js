import { useState, useEffect } from 'react';

export default function useCountUp(endValue, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const startVal = 0;
    // ensure endValue is a float
    const endVal = parseFloat(endValue) || 0;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
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
