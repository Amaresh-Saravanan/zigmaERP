import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 576) setBreakpoint('mobile');
      else if (width < 768) setBreakpoint('mobile-landscape');
      else if (width < 992) setBreakpoint('tablet');
      else if (width < 1200) setBreakpoint('desktop');
      else setBreakpoint('desktop-lg');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'desktop-lg',
    breakpoint,
  };
};
