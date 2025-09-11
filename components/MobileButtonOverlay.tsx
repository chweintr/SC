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
        // Full screen overlay to match your 16:9 image
        left: '0',
        top: '0',
        width: '100vw',
        height: '100vh',
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
          objectFit: 'cover',  // Cover the full viewport
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