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
        // Position just the button part where it needs to be
        left: '73%',
        top: '57%',
        transform: 'translate(-50%, -50%)',
        width: '120px',  // Adjust to your button size
        height: '120px',
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
          objectFit: 'contain',  // Keep button aspect ratio
          pointerEvents: 'none'  // Ensure image doesn't block
        }}
      />
      
    </div>
  );
}