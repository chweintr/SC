"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";
import MobileSoundToggle from "./MobileSoundToggle";
import DebugOverlay from "./DebugOverlay";
import ClickZone from "./ClickZone";

export default function HeroScene() {
  // Responsive sizing based on viewport
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });
  const backgroundVideoRef = React.useRef<HTMLVideoElement>(null);
  
  React.useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({ width, height });
      console.log(`Screen size: ${width}x${height}, Device: ${navigator.userAgent}`);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate responsive widget size - bigger to fill screen
  const getWidgetSize = () => {
    // Moving down to better fit in the lower part of the frame
    if (screenSize.width < 640) { // Mobile
      return { 
        size: "85vw",  // Reduced from 90vw for better button visibility
        top: "52%",    // Moved down to better align with frame
        left: "50%", 
        radius: "15px" 
      };
    } else if (screenSize.width < 1024) { // Tablet
      return { 
        size: "41vw", 
        top: "50%", 
        left: "50%", 
        radius: "25px" 
      };
    } else { // Desktop - keeping as is, looks good
      return { 
        size: "27vw", 
        top: "50%", 
        left: "50%", 
        radius: "30px" 
      };
    }
  };
  
  const widgetDimensions = getWidgetSize();
  
  // Override with URL params for quick testing: ?top=30&left=50&size=27
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const top = params.get('top');
      const left = params.get('left');
      const size = params.get('size');
      
      if (top) widgetDimensions.top = `${top}%`;
      if (left) widgetDimensions.left = `${left}%`;
      if (size) widgetDimensions.size = `${size}vw`;
    }
  }, []);

  // Start background video if autoplay fails
  React.useEffect(() => {
    if (backgroundVideoRef.current) {
      backgroundVideoRef.current.play().catch(e => {
        console.log("Background video autoplay failed, will play on user interaction");
        const tryPlay = () => {
          backgroundVideoRef.current?.play().catch(() => {});
        };
        document.addEventListener('click', tryPlay, { once: true });
        document.addEventListener('touchstart', tryPlay, { once: true });
      });
    }
  }, []);

  // Start ambient sounds when component mounts
  React.useEffect(() => {
    // Wait a moment for audio element to be ready
    setTimeout(() => {
      const audio = document.getElementById('forest-ambience') as HTMLAudioElement;
      if (audio) {
        audio.volume = 0.002; // Ultra quiet background volume (0.2%)
        // Try to play on user interaction or after a delay
        const playAudio = () => {
          audio.play().then(() => {
            console.log("Ambient audio started");
          }).catch(e => {
            console.log("Audio autoplay prevented, will play on user interaction");
            // Try on any user interaction
            const tryPlay = () => {
              audio.play().then(() => {
                console.log("Audio started after interaction");
              }).catch(() => {});
            };
            
            document.addEventListener('click', tryPlay, { once: true });
            document.addEventListener('touchstart', tryPlay, { once: true });
            document.addEventListener('keydown', tryPlay, { once: true });
          });
        };
        
        // Check if audio is ready
        if (audio.readyState >= 2) {
          playAudio();
        } else {
          audio.addEventListener('canplay', playAudio, { once: true });
        }
      }
    }, 1000);
  }, []);

  return (
    <>
      {/* Debug Overlay - add ?debug=true to URL to see */}
      <DebugOverlay />
      
      {/* Mobile Sound Toggle */}
      <MobileSoundToggle />
      
      {/* Click Zone for red button - highest layer */}
      <ClickZone />
      
      {/* App Title */}
      <div className="fixed top-8 left-0 right-0 z-30 flex justify-center">
        <h1 className="text-5xl md:text-7xl font-black text-white uppercase"
            style={{ 
              fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
              letterSpacing: "0.05em",
              fontWeight: 900,
              textShadow: `
                0 2px 0 #0a7e53,
                0 4px 0 #065f46,
                0 6px 0 #064e3b,
                0 8px 0 #022c22,
                0 10px 20px rgba(0,0,0,0.9),
                0 0 60px rgba(16,185,129,0.8)
              `,
              transform: "perspective(300px) rotateY(-5deg)",
              animation: "titleGlow 3s ease-in-out infinite alternate"
            }}>
          SQUATCHCHAT
        </h1>
        <style jsx>{`
          @keyframes titleGlow {
            0% { filter: brightness(1) contrast(1); }
            100% { filter: brightness(1.2) contrast(1.1); }
          }
        `}</style>
      </div>

      {/* bottom: full-page 16:9 video */}
      <video 
        ref={backgroundVideoRef}
        className="fixed inset-0 -z-30 h-[100dvh] w-screen object-cover background-video"
        autoPlay 
        muted 
        loop 
        playsInline
        preload="auto"
        onLoadedData={() => {
          console.log("Background video loaded");
          // Report to UI if needed
          window.dispatchEvent(new CustomEvent('videoStatus', { detail: 'loaded' }));
        }}
        onError={(e) => {
          console.error("Background video error:", e);
          alert(`Video failed to load. Check console for details.`);
        }}
        onPlay={() => {
          console.log("Background video playing");
          window.dispatchEvent(new CustomEvent('videoStatus', { detail: 'playing' }));
        }}
      >
        <source src="/video/hero_16x9.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* middle: Simli widget - BELOW overlay */}
      <div className="fixed z-10"
           style={{ 
             left: widgetDimensions.left || "50%", 
             top: widgetDimensions.top, 
             width: widgetDimensions.size, 
             height: widgetDimensions.size,
             transform: "translate(-50%,-50%)", 
             borderRadius: widgetDimensions.radius,
             background: "transparent",  // Transparent background
             overflow: "hidden"   // Clip content to frame
           }}>
        <SimliSquare />
      </div>
      
      {/* top: full-page PNG overlay with transparent window */}
      <img src="/Overlay_9.png" alt=""
           className="fixed inset-0 z-20 pointer-events-none"
           style={{ width:"100%", height:"100%", objectFit:"cover" }} />

      {/* Ambient forest sounds */}
      <audio 
        id="forest-ambience" 
        loop 
        autoPlay
        preload="auto" 
        controls 
        style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 100, opacity: 0.3, width: '200px' }}
      >
        <source src="/audio/enchanted-forest.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}// Force rebuild at Wed Sep 10 18:49:59 EDT 2025
