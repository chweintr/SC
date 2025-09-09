"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";

export default function HeroScene() {
  // Adjust to better fit the device screen area
  // Making it slightly larger to hide borders but stay within screen
  const SCREEN_AREA = { 
    left: "50%", 
    top: "52%",  
    width: "25vw",  // Increased to hide borders better
    height: "25vw", 
    radius: "20px" 
  };

  // Start ambient sounds when component mounts
  React.useEffect(() => {
    const audio = document.getElementById('forest-ambience') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.2; // Low volume
      audio.play().catch(e => console.log("Audio autoplay blocked:", e));
    }
  }, []);

  return (
    <>
      {/* App Title */}
      <div className="fixed top-4 left-0 right-0 z-20 flex justify-center">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            style={{ 
              fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive",
              textShadow: "3px 3px 6px rgba(0,0,0,0.9), 0 0 30px rgba(16,185,129,0.5)",
              letterSpacing: "0.1em"
            }}>
          SQUATCHAT
        </h1>
      </div>

      {/* bottom: full-page 16:9 video */}
      <video className="fixed inset-0 -z-30 h-[100dvh] w-screen object-cover"
             autoPlay muted loop playsInline src="/video/hero_16x9.mp4" />

      {/* middle: Simli widget - always visible */}
      <div className="fixed -z-10"
           style={{ 
             left: SCREEN_AREA.left, 
             top: SCREEN_AREA.top, 
             width: SCREEN_AREA.width, 
             height: SCREEN_AREA.height,
             transform: "translate(-50%,-50%)", 
             borderRadius: SCREEN_AREA.radius,
             background: "#000",  // Black background to hide any gaps
             overflow: "hidden"   // Clip any content that exceeds bounds
           }}>
        <SimliSquare />
      </div>

      {/* top: full-page PNG overlay with transparent window */}
      <img src="/public_ui_device_frame.png" alt=""
           className="fixed inset-0 -z-20 pointer-events-none"
           style={{ width:"100%", height:"100%", objectFit:"cover" }} />

      {/* Ambient forest sounds */}
      <audio id="forest-ambience" loop>
        <source src="/audio/enchanted-forest.wav" type="audio/wav" />
        Your browser does not support the audio element.
      </audio>
    </>
  );
}