"use client";
import * as React from "react";

export default function SimliSquare({ active }: { active: boolean }) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    // Only create widget when active
    if (!active) {
      // Clean up widget when deactivated
      if (widgetRef.current && hostRef.current) {
        console.log("SimliSquare: Removing widget");
        hostRef.current.removeChild(widgetRef.current);
        widgetRef.current = null;
      }
      return;
    }

    // Already have a widget
    if (widgetRef.current) return;

    (async () => {
      console.log("SimliSquare: Fetching token...");
      const r = await fetch("/api/simli/token", { cache: "no-store" });
      if (!r.ok) {
        console.error("Token error", await r.text());
        return;
      }

      const responseData = await r.json();
      const { token, avatarid, _isMock } = responseData;

      console.log("SimliSquare: Got token and avatar ID:", avatarid);

      // In development with mock token, don't show anything
      if (_isMock) {
        console.log("SimliSquare: Using mock token for development");
        return;
      }

      const el = document.createElement("simli-widget");

      // Set all property variants the widget might expect
      (el as any).token = token;
      (el as any).avatarid = avatarid;
      (el as any).avatarId = avatarid;
      (el as any).agentId = avatarid;
      (el as any).agentid = avatarid;
      (el as any).overlay = false;

      // Also set as attributes
      el.setAttribute("token", token);
      el.setAttribute("avatarid", avatarid);
      el.setAttribute("avatarId", avatarid);
      el.setAttribute("agentId", avatarid);
      el.setAttribute("overlay", "false");
      el.setAttribute("style", "display:block;width:100%;height:100%;background:transparent");

      // Debug errors
      el.addEventListener('error', (e) => {
        console.error("SimliWidget error:", e);
      });

      // Watch for Simli video stream to start
      const observer = new MutationObserver(() => {
        const simliVideo = el.querySelector('video[srcObject]') as HTMLVideoElement;
        if (simliVideo && simliVideo.srcObject) {
          console.log("Simli stream detected");
          // Apply mute state if needed
          const isMuted = sessionStorage.getItem('audioMuted') === 'true';
          if (isMuted) {
            simliVideo.muted = true;
            el.querySelectorAll('audio').forEach(audio => {
              (audio as HTMLAudioElement).muted = true;
            });
          }
        }
      });

      observer.observe(el, { attributes: true, childList: true, subtree: true });

      // Change button text based on screen size
      const updateButtons = () => {
        const isMobile = window.innerWidth < 768;
        const buttons = el.querySelectorAll('button');
        buttons.forEach(button => {
          if (isMobile) {
            // Hide all text on mobile
            button.textContent = '';
            button.innerHTML = '';
          } else {
            // Desktop labels
            if (button.textContent?.includes('Start')) {
              button.textContent = 'Start';
            } else if (button.textContent?.includes('Stop') || button.textContent?.includes('Close')) {
              button.textContent = 'End';
            }
          }
        });
      };

      // Watch for button changes
      const buttonObserver = new MutationObserver(updateButtons);
      buttonObserver.observe(el, { childList: true, subtree: true, characterData: true });

      // Update buttons after delays
      setTimeout(updateButtons, 100);
      setTimeout(updateButtons, 500);
      setTimeout(updateButtons, 1000);

      // Add widget styles
      if (!document.getElementById('simli-widget-styles')) {
        const style = document.createElement('style');
        style.id = 'simli-widget-styles';
        style.textContent = `
          /* Simli widget button styling */
          simli-widget button {
            background: #8B4513 !important;
            color: #FFF8DC !important;
            border-radius: 50% !important;
            width: 80px !important;
            height: 80px !important;
            font-weight: 900 !important;
            font-size: 16px !important;
            border: 3px solid #654321 !important;
            cursor: pointer !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3),
                        0 4px 8px rgba(0,0,0,0.5) !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
            font-family: "Impact", "Arial Black", sans-serif !important;
          }

          simli-widget button:hover {
            background: #A0522D !important;
            transform: scale(1.05) !important;
          }

          /* Mobile: No text */
          @media (max-width: 767px) {
            simli-widget button {
              font-size: 0 !important;
              min-width: 60px !important;
              min-height: 60px !important;
              color: transparent !important;
            }
            simli-widget button * {
              display: none !important;
            }
          }

          /* Widget container */
          simli-widget {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
            background: transparent !important;
          }

          simli-widget > div {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
          }

          /* Video styling */
          simli-widget video,
          simli-widget canvas {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Transparent backgrounds */
          simli-widget,
          simli-widget * {
            background: transparent !important;
            background-color: transparent !important;
          }
        `;
        document.head.appendChild(style);
      }

      if (hostRef.current) {
        hostRef.current.appendChild(el);
        widgetRef.current = el;
        console.log("SimliSquare: Widget element added to DOM");
      }
    })();

    // Cleanup on unmount
    return () => {
      if (widgetRef.current && hostRef.current) {
        try {
          hostRef.current.removeChild(widgetRef.current);
        } catch (e) {
          // Already removed
        }
        widgetRef.current = null;
      }
    };
  }, [active]);

  if (!active) {
    return null; // Transparent when inactive, show idle video underneath
  }

  return <div ref={hostRef} className="h-full w-full" />;
}
