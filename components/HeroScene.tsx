"use client";
import * as React from "react";
import SimliSquare from "./SimliSquare";

export default function HeroScene() {
  const [showAvatar, setShowAvatar] = React.useState(false);

  // adjust to align with your overlay's transparent window
  const HOLE = { left:"50%", top:"55%", size:"28vw", radius:"20px" };

  return (
    <>
      {/* bottom: full-page 16:9 video */}
      <video className="fixed inset-0 -z-30 h-[100dvh] w-screen object-cover"
             autoPlay muted loop playsInline src="/video/hero_16x9.mp4" />

      {/* middle: square Simli agent */}
      <div className="fixed -z-10 overflow-hidden"
           style={{ left:HOLE.left, top:HOLE.top, width:HOLE.size, height:HOLE.size,
                    transform:"translate(-50%,-50%)", borderRadius:HOLE.radius, background:"#000" }}>
        {showAvatar ? (
          <SimliSquare />
        ) : (
          <div className="grid h-full w-full place-items-center text-white/80">Click "Summon"</div>
        )}
      </div>

      {/* summon */}
      <div className="fixed top-4 left-0 right-0 z-10 flex justify-center">
        <button 
          onClick={() => setShowAvatar(!showAvatar)} 
          className="rounded-xl px-4 py-2 bg-white/90 text-black shadow"
        >
          {showAvatar ? "Hide" : "Summon"}
        </button>
      </div>

      {/* top: full-page PNG overlay with transparent window */}
      <img src="/public_ui_device_frame.png" alt=""
           className="fixed inset-0 -z-20 pointer-events-none"
           style={{ width:"100%", height:"100%", objectFit:"cover" }} />
    </>
  );
}