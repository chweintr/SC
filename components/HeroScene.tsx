"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";
import MobileSoundToggle from "./MobileSoundToggle";
import DebugOverlay from "./DebugOverlay";
import ClickZone from "./ClickZone";

export default function HeroScene() {
  // Responsive sizing based on viewport
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });
  const [isChatActive, setIsChatActive] = React.useState(false);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [showInstructions, setShowInstructions] = React.useState(true);
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
        size: "90vw",  // Increased to 90vw to fill the frame width
        top: "50%",    // Centered vertically
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
          backgroundVideoRef.current?.play().catch(() => { });
        };
        document.addEventListener('click', tryPlay, { once: true });
        document.addEventListener('touchstart', tryPlay, { once: true });
      });
    }
  }, []);

  // Listen for ClickZone events (it handles the actual Simli triggering)
  React.useEffect(() => {
    const handleButtonClick = () => {
      console.log('🔴 Button clicked - showing message');
      setShowInstructions(false);
      setIsConnecting(true);
      setIsChatActive(true); // Start the chat

      // Auto-hide "Connecting" message after 5 seconds
      setTimeout(() => {
        console.log('⏰ Message timeout - hiding');
        setIsConnecting(false);
      }, 5000);
    };

    // Listen for the custom event from ClickZone
    document.addEventListener('squatch-button-clicked', handleButtonClick);

    return () => {
      document.removeEventListener('squatch-button-clicked', handleButtonClick);
    };
  }, []);

  // Start ambient sounds when component mounts
  React.useEffect(() => {
    // Wait a moment for audio element to be ready
    setTimeout(() => {
      const audio = document.getElementById('forest-ambience') as HTMLAudioElement;
      if (audio) {
        // Set volume based on device - lower volume for better UX
        const isMobile = window.innerWidth < 768;
        audio.volume = isMobile ? 0.08 : 0.12; // 8% mobile, 12% desktop
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
              }).catch(() => { });
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

  const handleDisconnect = () => {
    setIsChatActive(false);
    setShowInstructions(true);
  };

  return (
    <>
      {/* Debug Overlay - add ?debug=true to see */}
      <DebugOverlay />

      {/* Mobile Sound Toggle */}
      <MobileSoundToggle />

      {/* Click Zone for red button - highest layer */}
      {!isChatActive && <ClickZone />}

      {/* App Title - Fixed to viewport top */}
      <div className="fixed top-8 left-0 right-0 z-30 flex justify-center pointer-events-none">
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

      {/* MAIN CONTAINER: Centers the 16:9 content in the viewport */}
      <div className="fixed inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">

        {/* ASPECT RATIO CONTAINER: 
            Mobile: Full screen (vertical/portrait)
            Desktop: Forces 16:9 and fits within viewport 
        */}
        <div className="relative w-full h-full md:aspect-video md:h-auto md:max-h-full md:max-w-full shadow-2xl">

          {/* 1. Background Video */}
          <video
            ref={backgroundVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/video/hero_16x9.mp4" type="video/mp4" />
          </video>

          {/* 2. Simli Widget (The Face) - Positioned relative to the 16:9 frame */}
          <div className="absolute z-10 overflow-hidden rounded-[30px]"
            style={{
              left: widgetDimensions.left,
              top: widgetDimensions.top,
              width: widgetDimensions.size,
              aspectRatio: "1/1", // Keep it square
              transform: "translate(-50%, -50%)",
              borderRadius: widgetDimensions.radius,
            }}>
            <SimliSquare active={isChatActive} />
          </div>

          {/* 3. Overlay Image - Covers the video perfectly */}
          <img src="/Overlay_9.png" alt=""
            className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none"
            style={{
              filter: "blur(0.5px)"
            }} />

          {/* Connecting Message */}
          {isConnecting && (
            <div
              className="absolute pointer-events-none z-[9999]"
              style={{
                left: "75%",
                top: "72%",
                transform: "translateX(-50%)",
                textAlign: "center",
              }}
            >
              <p className="text-white text-sm md:text-base font-bold px-4 py-2 rounded-lg"
                style={{
                  background: "rgba(0,0,0,0.8)",
                  textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.05em"
                }}>
                Hang tight...<br />Squatch is connecting
              </p>
            </div>
          )}

          {/* Instructions */}
          {showInstructions && !isConnecting && (
            <div
              className="absolute pointer-events-none z-[1000]"
              style={{
                left: "75%",
                top: "70%",
                transform: "translateX(-50%)",
                textAlign: "center",
              }}
            >
              <p className="text-white text-base md:text-xl font-bold px-4"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)",
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.1em"
                }}>
                PRESS RED<br />BUTTON
              </p>
            </div>
          )}

          {/* Disconnect Button - Replaces Instructions when Active */}
          {isChatActive && !isConnecting && (
            <div
              className="absolute z-[1000]"
              style={{
                left: "75%",
                top: "70%",
                transform: "translateX(-50%)",
                textAlign: "center",
              }}
            >
              <button
                onClick={handleDisconnect}
                className="text-white text-base md:text-xl font-bold px-6 py-2 rounded-full transition-transform active:scale-95 hover:bg-red-900/50"
                style={{
                  background: "rgba(220, 38, 38, 0.8)", // Red background
                  border: "2px solid rgba(255, 255, 255, 0.5)",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.1em",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                }}>
                DISMISS
              </button>
            </div>
          )}
        </div>
      </div>

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
      </audio>
    </>
  );
}
