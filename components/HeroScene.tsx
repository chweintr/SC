"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";
import MobileSoundToggle from "./MobileSoundToggle";
import DebugOverlay from "./DebugOverlay";
import ClickZone from "./ClickZone";

const OVERLAY_ASSET = { width: 1408, height: 736 };
const MOUNT_OVERLAY = {
  left: 557,
  top: 185,
  width: 311,
  height: 310,
  radius: 28,
};
const BUTTON_OVERLAY = { x: 852, y: 526, size: 120 };

export default function HeroScene() {
  // Responsive sizing based on viewport
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isSessionActive, setIsSessionActive] = React.useState(false);
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
    const left = overlayFrame.left + MOUNT_OVERLAY.left * overlayFrame.scale;
    const top = overlayFrame.top + MOUNT_OVERLAY.top * overlayFrame.scale;
    const width = MOUNT_OVERLAY.width * overlayFrame.scale;
    const height = MOUNT_OVERLAY.height * overlayFrame.scale;
    const radius = MOUNT_OVERLAY.radius * overlayFrame.scale;
    return { left, top, width, height, radius };
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

  const handleTransmissionToggle = React.useCallback(() => {
    const controller = window.__squatchSimliController;
    if (controller?.isReady()) {
      const action = controller.toggle();
      if (action) {
        document.dispatchEvent(new CustomEvent("squatch-button-clicked", { detail: { action } }));
        return;
      }
    }

    const proxyButton = document.getElementById("simliOverlayBtn") as HTMLButtonElement | null;
    if (proxyButton) {
      proxyButton.click();
      return;
    }

    let attempts = 0;
    const retry = window.setInterval(() => {
      attempts += 1;
      const retryController = window.__squatchSimliController;
      const action = retryController?.isReady() ? retryController.toggle() : null;
      if (action) {
        document.dispatchEvent(new CustomEvent("squatch-button-clicked", { detail: { action } }));
      }
      if (action || attempts >= 10) {
        window.clearInterval(retry);
      }
    }, 250);
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

  // Listen for ClickZone events (it handles the actual Simli triggering)
  React.useEffect(() => {
    const handleButtonClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ action?: "connect" | "disconnect" }>;
      const action = customEvent.detail?.action;

      if (action === "disconnect") {
        setIsConnecting(false);
        setIsSessionActive(false);
        setShowInstructions(true);
        return;
      }

      setShowInstructions(false);
      setIsSessionActive(true);
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
              left: `${widgetPx.left}px`,
              top: `${widgetPx.top}px`,
              width: `${widgetPx.width}px`,
              height: `${widgetPx.height}px`,
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
              left: `${widgetPx.left}px`,
              top: `${widgetPx.top}px`,
              width: `${widgetPx.width}px`,
              height: `${widgetPx.height}px`,
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
              width: `${buttonPx.size * 1.2}px`,
              height: `${buttonPx.size * 1.2}px`,
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
                LINKING TRAIL-CAM...<br />
                acquiring signal
              </p>
            </div>
          )}

        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 z-[80] w-[min(92vw,420px)] -translate-x-1/2 px-4">
        <div
          className="rounded-[28px] border border-[#e7c37a]/35 bg-[rgba(8,10,10,0.76)] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          style={{
            boxShadow:
              "0 18px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(231,195,122,0.08)",
          }}
        >
          <div className="mb-3 flex items-center justify-between px-1">
            <div>
              <p
                className="text-[11px] uppercase text-[#f7d79c]"
                style={{
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.22em",
                }}
              >
                Forest Relay
              </p>
              <p className="text-xs text-white/70">
                {isConnecting
                  ? "Opening live channel"
                  : isSessionActive
                    ? "Conversation live"
                    : "Ready to connect"}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: isConnecting ? "#f59e0b" : isSessionActive ? "#ef4444" : "#34d399",
                  boxShadow: isConnecting
                    ? "0 0 16px rgba(245,158,11,0.9)"
                    : isSessionActive
                      ? "0 0 18px rgba(239,68,68,0.95)"
                      : "0 0 14px rgba(52,211,153,0.8)",
                }}
              />
              <span
                className="text-[10px] uppercase text-white/80"
                style={{
                  fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                  letterSpacing: "0.16em",
                }}
              >
                {isConnecting ? "Linking" : isSessionActive ? "Live" : "Standby"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTransmissionToggle}
            disabled={isConnecting}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-[22px] border px-5 py-4 text-left transition duration-200 disabled:cursor-wait disabled:opacity-80"
            style={{
              borderColor: isSessionActive ? "rgba(248,113,113,0.55)" : "rgba(231,195,122,0.42)",
              background: isSessionActive
                ? "linear-gradient(135deg, rgba(91,19,19,0.95), rgba(37,7,7,0.92))"
                : "linear-gradient(135deg, rgba(51,27,11,0.94), rgba(15,9,7,0.96))",
              boxShadow: isSessionActive
                ? "0 14px 30px rgba(120,22,22,0.35), inset 0 1px 0 rgba(255,255,255,0.08)"
                : "0 14px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
            aria-label={isSessionActive ? "End transmission" : "Start transmission"}
          >
            <div className="absolute inset-0 opacity-40">
              <div
                className="h-full w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 24%, transparent 48%, transparent 100%)",
                }}
              />
            </div>

            <div className="relative flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full border"
                style={{
                  borderColor: isSessionActive ? "rgba(252,165,165,0.55)" : "rgba(252,211,77,0.38)",
                  background: isSessionActive
                    ? "radial-gradient(circle at 35% 35%, #ff8d8d 0%, #e11d48 42%, #3f0a12 100%)"
                    : "radial-gradient(circle at 35% 35%, #fef08a 0%, #f97316 40%, #3b1708 100%)",
                  boxShadow: isSessionActive
                    ? "0 0 26px rgba(244,63,94,0.5)"
                    : "0 0 22px rgba(249,115,22,0.42)",
                }}
              >
                <span
                  className="block h-4 w-4 rounded-full bg-white/95"
                  style={{ boxShadow: "0 0 12px rgba(255,255,255,0.8)" }}
                />
              </div>

              <div>
                <p
                  className="text-[22px] uppercase leading-none text-white"
                  style={{
                    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                    letterSpacing: "0.08em",
                  }}
                >
                  {isConnecting
                    ? "Connecting"
                    : isSessionActive
                      ? "End Transmission"
                      : "Start Transmission"}
                </p>
                <p className="mt-1 text-sm text-white/65">
                  {isSessionActive
                    ? "Tap to close the live channel."
                    : "Tap to begin the live channel."}
                </p>
              </div>
            </div>

            <div
              className="relative rounded-full border px-3 py-1 text-[10px] uppercase text-white/80"
              style={{
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                letterSpacing: "0.2em",
                borderColor: "rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {isSessionActive ? "Close" : "Open"}
            </div>
          </button>
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
