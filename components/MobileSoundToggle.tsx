"use client";
import * as React from "react";

export default function MobileSoundToggle() {
  const [isMuted, setIsMuted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile viewport
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tablet and below
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle audio for all audio/video elements
  const toggleAudio = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Mute/unmute all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = newMutedState;
    });
    
    // Mute/unmute all video elements except background (including Simli)
    const videoElements = document.querySelectorAll('video:not(.background-video)');
    videoElements.forEach(video => {
      video.muted = newMutedState;
    });
    
    // Handle Simli widget specifically
    const simliWidget = document.querySelector('simli-widget');
    if (simliWidget) {
      // Try to find Simli's internal audio/video elements
      const simliMedia = simliWidget.querySelectorAll('audio, video');
      simliMedia.forEach(media => {
        media.muted = newMutedState;
      });
    }
    
    // Store state for new media elements
    sessionStorage.setItem('audioMuted', String(newMutedState));
  };

  // Watch for new audio/video elements (for Simli dynamic content)
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      const muted = sessionStorage.getItem('audioMuted') === 'true';
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') {
            (node as HTMLMediaElement).muted = muted;
          }
          
          // Check children for audio/video elements
          if (node.nodeType === 1) { // Element node
            const mediaElements = (node as Element).querySelectorAll('audio, video:not(.background-video)');
            mediaElements.forEach(media => {
              (media as HTMLMediaElement).muted = muted;
            });
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }, []);

  // Load saved state
  React.useEffect(() => {
    const savedMuted = sessionStorage.getItem('audioMuted') === 'true';
    if (savedMuted) {
      setIsMuted(true);
      // Apply to existing elements
      document.querySelectorAll('audio, video').forEach(media => {
        (media as HTMLMediaElement).muted = true;
      });
    }
  }, []);

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <button
      onClick={toggleAudio}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 transition-all hover:bg-black/70 active:scale-95"
      aria-label={isMuted ? "Unmute audio" : "Mute audio"}
    >
      {isMuted ? (
        // Muted icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
          <path d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V10.18L16.45 12.63C16.48 12.43 16.5 12.22 16.5 12Z" fill="currentColor"/>
          <path d="M19 12C19 12.94 18.8 13.82 18.46 14.64L19.97 16.15C20.63 14.91 21 13.5 21 12C21 7.72 18.01 4.14 14 3.23V5.29C16.89 6.15 19 8.83 19 12Z" fill="currentColor"/>
          <path d="M4.27 3L3 4.27L7.73 9H3V15H7L12 20V13.27L16.25 17.52C15.58 18.04 14.83 18.45 14 18.7V20.76C15.38 20.45 16.63 19.81 17.69 18.95L19.73 21L21 19.73L12 10.73L4.27 3Z" fill="currentColor"/>
          <path d="M12 4L9.91 6.09L12 8.18V4Z" fill="currentColor"/>
        </svg>
      ) : (
        // Sound on icon
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
          <path d="M3 9V15H7L12 20V4L7 9H3Z" fill="currentColor"/>
          <path d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12Z" fill="currentColor"/>
          <path d="M14 3.23V5.29C16.89 6.15 19 8.83 19 12C19 15.17 16.89 17.84 14 18.7V20.77C18.01 19.86 21 16.28 21 12C21 7.72 18.01 4.14 14 3.23Z" fill="currentColor"/>
        </svg>
      )}
    </button>
  );
}