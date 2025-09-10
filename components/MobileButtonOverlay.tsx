"use client";
import * as React from "react";

export default function MobileButtonOverlay() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div 
      className="fixed z-25"
      style={{
        // Position this exactly where the button cutout is
        left: '73%',     // Adjusted for right side button position
        top: '52%',      // Match Simli widget position
        transform: 'translate(-50%, -50%)',
        width: '100px',  // Adjust based on your overlay size
        height: '100px',
        // This is the key - allows clicks to pass through
        pointerEvents: 'none'
      }}
    >
      {/* Visual overlay that doesn't block clicks */}
      <img 
        src="/button_overlay.png" 
        alt=""
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none'  // Ensure image doesn't block
        }}
      />
      
      {/* Or use a styled div instead of image */}
      {/* <div 
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid #8B4513',
          background: 'radial-gradient(circle, rgba(139,69,19,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }}
      /> */}
    </div>
  );
}