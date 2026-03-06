"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";
import MobileSoundToggle from "./MobileSoundToggle";
import DebugOverlay from "./DebugOverlay";
import ClickZone from "./ClickZone";

const OVERLAY_ASSET = { width: 1408, height: 736 };
const WIDGET_OVERLAY = { x: 712, y: 339.5, size: 311, radius: 28 };
const BUTTON_OVERLAY = { x: 852, y: 526, size: 120 };

export default function HeroScene() {
  // Responsive sizing based on viewport
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });
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

  // Convert source-image coordinates to viewport coordinates using object-fit: cover math.
  const overlayFrame = React.useMemo(() => {
    if (!screenSize.width || !screenSize.height) {
      return { left: 0, top: 0, scale: 1, width: 0, height: 0 };
    }
    const scale = Math.max(
      screenSize.width / OVERLAY_ASSET.width,
      screenSize.height / OVERLAY_ASSET.height
    );
    const width = OVERLAY_ASSET.width * scale;
    const height = OVERLAY_ASSET.height * scale;
    const left = (screenSize.width - width) / 2;
    const top = (screenSize.height - height) / 2;
    return { left, top, scale, width, height };
  }, [screenSize.height, screenSize.width]);

  const widgetPx = React.useMemo(() => {
    const centerX = overlayFrame.left + WIDGET_OVERLAY.x * overlayFrame.scale;
    const centerY = overlayFrame.top + WIDGET_OVERLAY.y * overlayFrame.scale;
    const size = WIDGET_OVERLAY.size * overlayFrame.scale;
    const radius = WIDGET_OVERLAY.radius * overlayFrame.scale;
    return { centerX, centerY, size, radius };
  }, [overlayFrame]);

  const buttonPx = React.useMemo(() => {
    const centerX = overlayFrame.left + BUTTON_OVERLAY.x * overlayFrame.scale;
    const centerY = overlayFrame.top + BUTTON_OVERLAY.y * overlayFrame.scale;
    const rawSize = BUTTON_OVERLAY.size * overlayFrame.scale;
    const size = Math.max(74, Math.min(rawSize, 180));
    return { centerX, centerY, size };
  }, [overlayFrame]);

  const instructionY = buttonPx.centerY + buttonPx.size * 0.9;
  const connectingY = buttonPx.centerY + buttonPx.size * 1.15;

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

  // Listen for ClickZone events (it handles the actual Simli triggering)
  React.useEffect(() => {
    const handleButtonClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ action?: "connect" | "disconnect" }>;
      const action = customEvent.detail?.action;

      if (action === "disconnect") {
        setIsConnecting(false);
        setShowInstructions(true);
        return;
      }

      setShowInstructions(false);
      setIsConnecting(true);

      window.setTimeout(() => {
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

      {/* Stage - full viewport so overlay stays full-screen on all surfaces */}
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <div
          className="relative w-full h-full"
        >
          {/* Idle video - plays in mount until Simli starts */}
          <video
            id="idle-video"
            className="absolute z-[5] pointer-events-none"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              left: `${widgetPx.centerX}px`,
              top: `${widgetPx.centerY}px`,
              width: `${widgetPx.size}px`,
              height: `${widgetPx.size}px`,
              transform: "translate(-50%,-50%)",
              borderRadius: `${widgetPx.radius}px`,
              objectFit: "cover",
            }}
          >
            <source src="/squatch-idle.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* middle: Simli widget - BELOW overlay */}
          <div
            className="absolute z-10"
            style={{
              left: `${widgetPx.centerX}px`,
              top: `${widgetPx.centerY}px`,
              width: `${widgetPx.size}px`,
              height: `${widgetPx.size}px`,
              transform: "translate(-50%,-50%)",
              borderRadius: `${widgetPx.radius}px`,
              background: "transparent",
              overflow: "hidden",
            }}
          >
            <SimliSquare />
          </div>

          {/* top: full-page PNG overlay with transparent window - blurred edges */}
          <img
            src="/Overlay_9.png"
            alt=""
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(1px)",
            }}
          />

          {/* Click Zone for red button - highest layer */}
          <ClickZone
            className="pointer-events-auto"
            style={{
              left: `${buttonPx.centerX}px`,
              top: `${buttonPx.centerY}px`,
              width: `${buttonPx.size}px`,
              height: `${buttonPx.size}px`,
              transform: "translate(-50%, -50%)",
            }}
          />

          {/* Simple connecting message near button - shows for 5 seconds */}
          {isConnecting && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${buttonPx.centerX}px`,
                top: `${connectingY}px`,
                transform: "translate(-50%, 0)",
                textAlign: "center",
                zIndex: 9999,
              }}
            >
              <p
                className="text-white text-sm md:text-base font-bold px-4 py-2 rounded-lg"
                style={{
                  background: "rgba(0,0,0,0.8)",
                  textShadow: "0 2px 4px rgba(0,0,0,0.9)",
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                Hang tight...<br />
                Squatch is connecting
              </p>
            </div>
          )}

          {/* Instruction text - shows initially, positioned near red button */}
          {showInstructions && !isConnecting && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${buttonPx.centerX}px`,
                top: `${instructionY}px`,
                transform: "translate(-50%, 0)",
                textAlign: "center",
                zIndex: 1000,
              }}
            >
              <p
                className="text-white text-base md:text-xl font-bold px-4"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.8)",
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.1em",
                }}
              >
                PRESS RED<br />
                BUTTON
              </p>
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
        Your browser does not support the audio element.
      </audio>
    </>
  );
}// Force rebuild at Wed Sep 10 18:49:59 EDT 2025
