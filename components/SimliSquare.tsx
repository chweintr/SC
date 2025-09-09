"use client";
import * as React from "react";

export default function SimliSquare() {
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    (async () => {
      console.log("SimliSquare: Fetching token...");
      const r = await fetch("/api/simli/token", { cache: "no-store" });
      if (!r.ok) { 
        console.error("Token error", await r.text()); 
        return; 
      }
      
      const { token, avatarid } = await r.json();
      console.log("SimliSquare: Got token and avatar ID:", avatarid);
      console.log("SimliSquare: Full response:", { token: token?.substring(0, 20) + '...', avatarid });

      const el = document.createElement("simli-widget");
      (el as any).token = token;
      (el as any).avatarid = avatarid;   // <- avatar id, not face/agent
      (el as any).overlay = false;
      
      // Also try setting as attributes
      el.setAttribute("token", token);
      el.setAttribute("avatarid", avatarid);
      el.setAttribute("overlay", "false");
      el.setAttribute("style", "display:block;width:100%;height:100%;background:transparent");
      
      // Add event listeners to debug
      el.addEventListener('error', (e) => {
        console.error("SimliWidget error:", e);
      });
      
      // Clear the loading message before adding widget
      if (hostRef.current) {
        hostRef.current.innerHTML = '';
        hostRef.current.appendChild(el);
      }
      console.log("SimliSquare: Widget element added to DOM");
    })();
  }, []);

  return (
    <div ref={hostRef} className="h-full w-full bg-black/50 flex items-center justify-center">
      <div className="text-white/70 text-sm animate-pulse">Loading Simli...</div>
    </div>
  );
}