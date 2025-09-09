"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";

export default function HeroScene() {
  // Adjust to better fit the device screen area
  // Making it slightly smaller and positioned to fit within the visible screen
  const SCREEN_AREA = { 
    left: "50%", 
    top: "52%",  // Moved up slightly
    width: "22vw",  // Reduced from 28vw to fit better
    height: "22vw", 
    radius: "15px" 
  };

  return (
    <>
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
             background: "transparent"
           }}>
        <SimliSquare />
      </div>

      {/* top: full-page PNG overlay with transparent window */}
      <img src="/public_ui_device_frame.png" alt=""
           className="fixed inset-0 -z-20 pointer-events-none"
           style={{ width:"100%", height:"100%", objectFit:"cover" }} />
    </>
  );
}