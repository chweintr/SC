"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";

export default function HeroScene() {
  // Responsive sizing based on viewport
  const [screenSize, setScreenSize] = React.useState({ width: 0, height: 0 });
  
  React.useEffect(() => {
    const updateSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate responsive widget size - bigger to fill screen
  const getWidgetSize = () => {
    if (screenSize.width < 640) { // Mobile
      return { size: "80vw", top: "50%", left: "50%", radius: "15px" };
    } else if (screenSize.width < 1024) { // Tablet
      return { size: "41vw", top: "48.5%", left: "50%", radius: "25px" };
    } else { // Desktop
      return { size: "27vw", top: "48.5%", left: "50%", radius: "30px" };
    }
  };
  
  const widgetDimensions = getWidgetSize();

  // Start ambient sounds when component mounts
  React.useEffect(() => {
    // Wait a moment for audio element to be ready
    setTimeout(() => {
      const audio = document.getElementById('forest-ambience') as HTMLAudioElement;
      if (audio) {
        audio.volume = 0.02; // Extra quiet background volume (2%)
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
      {/* App Title */}
      <div className="fixed top-8 left-0 right-0 z-20 flex justify-center">
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
          SQUATCHAT
        </h1>
        <style jsx>{`
          @keyframes titleGlow {
            0% { filter: brightness(1) contrast(1); }
            100% { filter: brightness(1.2) contrast(1.1); }
          }
        `}</style>
      </div>

      {/* bottom: full-page 16:9 video */}
      <video className="fixed inset-0 -z-30 h-[100dvh] w-screen object-cover"
             autoPlay muted loop playsInline src="/video/hero_16x9.mp4" />

      {/* middle: Simli widget - below overlay */}
      <div className="fixed z-[5]"
           style={{ 
             left: widgetDimensions.left || "48%", 
             top: widgetDimensions.top, 
             width: widgetDimensions.size, 
             height: widgetDimensions.size,
             transform: "translate(-50%,-50%)", 
             borderRadius: widgetDimensions.radius,
             background: "#000",  // Black background to hide any gaps
             overflow: "hidden"   // Clip any content that exceeds bounds
           }}>
        <SimliSquare />
      </div>

      {/* top: full-page PNG overlay with transparent window */}
      <img src="/public_ui_device_frame_5.png" alt=""
           className="fixed inset-0 z-10 pointer-events-none"
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
}