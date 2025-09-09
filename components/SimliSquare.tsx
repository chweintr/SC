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
      
      // Log what we're setting
      console.log("Setting widget properties:", {
        token: token?.substring(0, 20) + '...',
        avatarid: avatarid,
        tokenType: typeof token,
        tokenLength: token?.length
      });
      
      // Try different property names the widget might expect
      (el as any).token = token;
      (el as any).avatarid = avatarid;
      (el as any).avatarId = avatarid;  // Try camelCase
      (el as any).agentId = avatarid;   // Try agentId
      (el as any).agentid = avatarid;   // Try lowercase
      (el as any).overlay = false;
      
      // Also set as attributes for redundancy
      el.setAttribute("token", token);
      el.setAttribute("avatarid", avatarid);
      el.setAttribute("avatarId", avatarid);
      el.setAttribute("agentId", avatarid);
      el.setAttribute("agentid", avatarid);
      el.setAttribute("overlay", "false");
      el.setAttribute("style", "display:block;width:100%;height:100%;background:transparent");
      
      // Add event listeners to debug
      el.addEventListener('error', (e) => {
        console.error("SimliWidget error:", e);
      });
      
      // Hide idle video only when Simli video stream starts
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' || mutation.type === 'childList') {
            const idleVideo = document.getElementById('idle-video') as HTMLVideoElement;
            // Check for actual Simli video stream (not dotted face)
            const simliVideo = el.querySelector('video[srcObject]') as HTMLVideoElement;
            if (idleVideo && simliVideo && simliVideo.srcObject) {
              console.log("Simli stream detected, hiding idle video");
              idleVideo.style.display = 'none';
            }
          }
        });
      });
      
      observer.observe(el, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      // Clear the loading message before adding widget
      if (hostRef.current) {
        // Keep the video element
        const idleVideo = hostRef.current.querySelector('#idle-video');
        hostRef.current.innerHTML = '';
        if (idleVideo) {
          hostRef.current.appendChild(idleVideo);
        }
        
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
          /* Target the Simli widget start button */
          simli-widget button:first-of-type,
          simli-widget button[aria-label*="Start"],
          simli-widget button:contains("Start") {
            background: #10b981 !important; /* Green for Summon */
            color: white !important;
            border-radius: 12px !important;
            padding: 16px 32px !important;
            font-weight: bold !important;
            font-size: 18px !important;
            transition: all 0.2s !important;
            border: none !important;
            cursor: pointer !important;
          }
          
          /* Close/Stop button */
          simli-widget button:last-of-type,
          simli-widget button[aria-label*="Close"],
          simli-widget button[aria-label*="Stop"] {
            background: #ec4899 !important; /* Pink for Dismiss */
            color: white !important;
          }
          
          simli-widget button:first-of-type:hover {
            background: #059669 !important;
            transform: scale(1.05) !important;
          }
          
          simli-widget button:last-of-type:hover {
            background: #db2777 !important;
            transform: scale(1.05) !important;
          }
          
          /* Override button text with CSS */
          simli-widget button[aria-label*="Start"]::after {
            content: "Summon" !important;
          }
          simli-widget button[aria-label*="Start"] {
            font-size: 0 !important;
          }
          simli-widget button[aria-label*="Start"]::after {
            font-size: 18px !important;
          }
          
          simli-widget button[aria-label*="Close"]::after,
          simli-widget button[aria-label*="Stop"]::after {
            content: "Dismiss" !important;
          }
          simli-widget button[aria-label*="Close"],
          simli-widget button[aria-label*="Stop"] {
            font-size: 0 !important;
          }
          simli-widget button[aria-label*="Close"]::after,
          simli-widget button[aria-label*="Stop"]::after {
            font-size: 18px !important;
          }
          
          /* Center the widget content */
          simli-widget {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
            background: #000 !important; /* Black background to hide borders */
          }
          
          /* Style the widget container */
          simli-widget > div {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
          }
          
          /* Hide the dotted face borders */
          simli-widget video,
          simli-widget canvas {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          /* Hide the dotted face animation and widget background */
          simli-widget img[src*="dottedface"],
          simli-widget .dotted-face,
          simli-widget [class*="loading"],
          simli-widget > div:not(:has(button)) {
            display: none !important;
          }
          
          /* Make widget background transparent until active */
          simli-widget {
            background: transparent !important;
          }
          
          /* Only hide idle video when Simli video is actually playing */
          simli-widget:has(video[src]) ~ #idle-video {
            display: none !important;
          }
          
          /* Position the widget button over the video */
          simli-widget {
            position: absolute !important;
            z-index: 10 !important;
          }
        `;
        document.head.appendChild(style);
        
        hostRef.current.appendChild(el);
      }
      console.log("SimliSquare: Widget element added to DOM");
    })();
  }, []);

  return (
    <div ref={hostRef} className="h-full w-full relative">
      {/* Custom idle video as placeholder */}
      <video 
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
        id="idle-video"
        style={{ display: 'block' }}
      >
        <source src="/squatch-idle.mp4" type="video/mp4" />
      </video>
    </div>
  );
}