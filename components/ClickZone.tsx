"use client";
import * as React from "react";

export default function ClickZone() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleClick = () => {
    // Find the actual Simli button and click it
    const simliWidget = document.querySelector('simli-widget');
    if (simliWidget) {
      const button = simliWidget.querySelector('button');
      if (button) {
        console.log('Forwarding click to Simli button');
        button.click();
      }
    }
  };

  if (!isMobile) return null;

  return (
    <div 
      className="fixed z-[60] cursor-pointer"
      onClick={handleClick}
      style={{
        // Position exactly where the red button is in Overlay_9
        left: '75%',  // Adjusted for red button position
        top: '61%',   // Lower position for the red button
        transform: 'translate(-50%, -50%)',
        width: '80px',
        height: '80px',
        // Invisible but clickable
        background: 'transparent',
        // Optional: show border during development
        // border: '2px dashed red',
      }}
      aria-label="Activate Squatch"
    />
  );
}