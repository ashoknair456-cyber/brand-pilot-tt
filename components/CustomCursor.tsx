import React, { useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailerRef = useRef<HTMLDivElement>(null);

  // Store coordinates in a ref to access them inside the animation loop without triggering re-renders
  const coords = useRef({ x: 0, y: 0 });
  const trailerCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only run on desktop
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);
    if (isMobile) return;

    const onMouseMove = (e: MouseEvent) => {
      coords.current.x = e.clientX;
      coords.current.y = e.clientY;
      
      // Update the main dot instantly
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    // Animation Loop for the trailer to create the "Liquid" lag effect
    let animationFrameId: number;
    
    const animateTrailer = () => {
        // Lerp factor: lower = slower/more liquid, higher = faster/snappier
        // 0.15 gives a nice fluid feel without being too laggy
        const lerpFactor = 0.15; 
        
        trailerCoords.current.x += (coords.current.x - trailerCoords.current.x) * lerpFactor;
        trailerCoords.current.y += (coords.current.y - trailerCoords.current.y) * lerpFactor;
        
        if (trailerRef.current) {
            // Subtract 16 to center the 32px circle
            trailerRef.current.style.transform = `translate3d(${trailerCoords.current.x - 16}px, ${trailerCoords.current.y - 16}px, 0)`;
        }
        
        animationFrameId = requestAnimationFrame(animateTrailer);
    };

    const onMouseDown = () => {
        if (cursorRef.current) cursorRef.current.style.transform += ' scale(0.8)';
        if (trailerRef.current) {
             trailerRef.current.style.width = '24px';
             trailerRef.current.style.height = '24px';
             trailerRef.current.style.backgroundColor = 'rgba(255,255,255,0.1)';
        }
    };

    const onMouseUp = () => {
        if (trailerRef.current) {
            trailerRef.current.style.width = '32px';
            trailerRef.current.style.height = '32px';
            trailerRef.current.style.backgroundColor = 'transparent';
        }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    
    // Start loop
    animateTrailer();

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Mobile check render
  if (typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
      return null;
  }

  return (
    <>
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-cyan-400 rounded-full mix-blend-difference pointer-events-none z-[9999] -mt-1 -ml-1 will-change-transform shadow-[0_0_10px_rgba(34,211,238,0.8)]"
      />
      <div 
        ref={trailerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-cyan-500/40 rounded-full pointer-events-none z-[9998] will-change-transform backdrop-blur-[1px]"
      />
    </>
  );
};

export default CustomCursor;