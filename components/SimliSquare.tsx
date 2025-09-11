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
              
              // Apply current mute state to Simli video
              const isMuted = sessionStorage.getItem('audioMuted') === 'true';
              if (isMuted) {
                simliVideo.muted = true;
                // Also mute any audio elements in the widget
                const audioElements = el.querySelectorAll('audio');
                audioElements.forEach(audio => {
                  (audio as HTMLAudioElement).muted = true;
                });
              }
            }
          }
        });
      });
      
      observer.observe(el, { 
        attributes: true, 
        childList: true, 
        subtree: true 
      });
      
      // Change button text - responsive based on screen size
      const changeButtonText = () => {
        const isMobile = window.innerWidth < 768;
        const buttons = el.querySelectorAll('button');
        buttons.forEach(button => {
          if (isMobile) {
            // Aggressively remove ALL text on mobile
            button.textContent = '';
            button.innerHTML = '';
            // Remove any text from all child elements
            button.querySelectorAll('*').forEach(child => {
              if (child.textContent) {
                child.textContent = '';
              }
            });
            // Remove text nodes
            Array.from(button.childNodes).forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = '';
              }
            });
            // Set aria-label to empty to prevent screen readers
            button.setAttribute('aria-label', '');
          } else {
            // Desktop text
            if (button.textContent?.includes('Start')) {
              button.textContent = 'Start';
            } else if (button.textContent?.includes('Connecting')) {
              button.textContent = '...';  // Ellipsis for connecting
            } else if (button.textContent?.includes('Stop') || button.textContent?.includes('Close')) {
              button.textContent = 'End';
            }
          }
        });
      };
      
      // Play connection sound when button is clicked
      const playConnectionSound = () => {
        console.log('Playing connection sound...');
        const audio = new Audio('/audio/connection_sound.wav');
        audio.volume = 0.3; // Increased to 30% volume
        audio.play()
          .then(() => console.log('Connection sound started'))
          .catch(e => console.error('Could not play connection sound:', e));
      };
      
      // Add click listener to play sound
      const addButtonClickListener = () => {
        const buttons = el.querySelectorAll('button');
        buttons.forEach(button => {
          // Only add listener to start button
          if (button.textContent?.includes('Start') || 
              button.getAttribute('aria-label')?.includes('Start')) {
            button.removeEventListener('click', playConnectionSound); // Remove if exists
            button.addEventListener('click', playConnectionSound);
          }
        });
      };
      
      // Watch for button creation and text changes
      const buttonObserver = new MutationObserver((mutations) => {
        changeButtonText();
        addButtonClickListener();
        
        // Extra aggressive for mobile - watch for ANY text changes
        if (window.innerWidth < 768) {
          mutations.forEach(mutation => {
            if (mutation.type === 'characterData' || mutation.type === 'childList') {
              const buttons = el.querySelectorAll('button');
              buttons.forEach(button => {
                if (button.textContent && button.textContent.trim() !== '') {
                  console.log('Removing text:', button.textContent);
                  button.textContent = '';
                  button.innerHTML = '';
                }
              });
            }
          });
        }
      });
      
      buttonObserver.observe(el, { 
        childList: true, 
        subtree: true, 
        characterData: true,
        characterDataOldValue: true 
      });
      
      // Also try immediately and after delays
      setTimeout(() => {
        changeButtonText();
        addButtonClickListener();
        // Debug: log button status
        const buttons = el.querySelectorAll('button');
        console.log(`[SimliSquare] Found ${buttons.length} buttons after 100ms`);
        buttons.forEach((btn, i) => {
          console.log(`Button ${i}: "${btn.textContent}", visible: ${btn.offsetWidth > 0}`);
        });
      }, 100);
      setTimeout(() => {
        changeButtonText();
        addButtonClickListener();
      }, 500);
      setTimeout(() => {
        changeButtonText();
        addButtonClickListener();
        // Final button check
        const buttons = el.querySelectorAll('button');
        console.log(`[SimliSquare] Final button count: ${buttons.length}`);
      }, 1000);
      
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
            background: #8B4513 !important; /* Brown metal color */
            color: #FFF8DC !important; /* Cream text */
            border-radius: 50% !important; /* Circular button */
            width: 80px !important;
            height: 80px !important;
            padding: 0 !important;
            font-weight: 900 !important;
            font-size: 16px !important;
            letter-spacing: 0.05em !important;
            text-transform: uppercase !important;
            transition: all 0.2s !important;
            border: 3px solid #654321 !important; /* Darker brown border */
            cursor: pointer !important;
            position: relative !important;
            z-index: 1000 !important;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 
                        0 4px 8px rgba(0,0,0,0.5),
                        inset 0 -2px 4px rgba(101,67,33,0.8) !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
            font-family: "Impact", "Arial Black", sans-serif !important;
          }
          
          /* Close/Stop button */
          simli-widget button:last-of-type,
          simli-widget button[aria-label*="Close"],
          simli-widget button[aria-label*="Stop"] {
            background: #ec4899 !important; /* Pink for Dismiss */
            color: white !important;
          }
          
          simli-widget button:first-of-type:hover {
            background: #A0522D !important; /* Lighter brown on hover */
            transform: scale(1.05) !important;
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 
                        0 6px 12px rgba(0,0,0,0.6),
                        inset 0 -2px 6px rgba(101,67,33,0.9) !important;
          }
          
          simli-widget button:last-of-type:hover {
            background: #db2777 !important;
            transform: scale(1.05) !important;
          }
          
          /* Desktop: Override button text with CSS */
          @media (min-width: 768px) {
            simli-widget button[aria-label*="Start"]::after {
              content: "Start" !important;
            }
            simli-widget button[aria-label*="Start"] {
              font-size: 0 !important;
            }
            simli-widget button[aria-label*="Start"]::after {
              font-size: 18px !important;
            }
            
            simli-widget button[aria-label*="Connecting"]::after {
              content: "..." !important;
            }
            simli-widget button[aria-label*="Connecting"] {
              font-size: 0 !important;
            }
            simli-widget button[aria-label*="Connecting"]::after {
              font-size: 18px !important;
            }
            
            simli-widget button[aria-label*="Close"]::after,
            simli-widget button[aria-label*="Stop"]::after {
              content: "End" !important;
            }
            simli-widget button[aria-label*="Close"],
            simli-widget button[aria-label*="Stop"] {
              font-size: 0 !important;
            }
            simli-widget button[aria-label*="Close"]::after,
            simli-widget button[aria-label*="Stop"]::after {
              font-size: 18px !important;
            }
          }
          
          /* Mobile: No text, just button - more aggressive */
          @media (max-width: 767px) {
            simli-widget button {
              font-size: 0 !important;
              min-width: 60px !important;
              min-height: 60px !important;
              text-indent: -9999px !important;
              color: transparent !important;
            }
            simli-widget button * {
              display: none !important;
            }
            simli-widget button::after,
            simli-widget button::before {
              content: "" !important;
              display: none !important;
            }
          }
          
          /* Center the widget content */
          simli-widget {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            height: 100% !important;
            width: 100% !important;
            background: transparent !important; /* Transparent background */
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
          
          /* Style the dotted face video */
          simli-widget video.dotted-face {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Hide other loading elements */
          simli-widget .loading:not(.dotted-face),
          simli-widget svg {
            opacity: 0 !important;
            visibility: hidden !important;
          }
          
          /* Make widget completely transparent */
          simli-widget,
          simli-widget * {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
          }
          
          /* Only show Simli video when stream is active */
          simli-widget video[srcObject] {
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Hide idle video when Simli stream starts */
          body:has(simli-widget video[srcObject]) #idle-video {
            display: none !important;
          }
          
          /* Ensure buttons stay visible */
          simli-widget button {
            opacity: 1 !important;
            visibility: visible !important;
            position: relative !important;
            z-index: 20 !important;
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