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
        
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
          /* Target the Simli widget start button */
          simli-widget button {
            background: #10b981 !important; /* Emerald/viridian color */
            color: white !important;
            border-radius: 12px !important;
            padding: 16px 32px !important;
            font-weight: bold !important;
            font-size: 18px !important;
            transition: all 0.2s !important;
            border: none !important;
            cursor: pointer !important;
          }
          
          simli-widget button:hover {
            background: #059669 !important;
            transform: scale(1.05) !important;
          }
          
          /* Center the widget content */
          simli-widget {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
          }
          
          /* Style the widget container */
          simli-widget > div {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
          }
        `;
        document.head.appendChild(style);
        
        hostRef.current.appendChild(el);
      }
      console.log("SimliSquare: Widget element added to DOM");
    })();
  }, []);

  return <div ref={hostRef} className="h-full w-full" />;
}