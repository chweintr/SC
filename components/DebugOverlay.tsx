"use client";
import * as React from "react";

export default function DebugOverlay() {
  const [info, setInfo] = React.useState({
    width: 0,
    height: 0,
    device: "",
    userAgent: "",
    isMobile: false,
    widgetSize: "",
  });

  React.useEffect(() => {
    const updateInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ua = navigator.userAgent;
      const isMobile = width < 768;
      
      let widgetSize = "";
      if (width < 640) {
        widgetSize = "80vw (mobile)";
      } else if (width < 1024) {
        widgetSize = "41vw (tablet)";
      } else {
        widgetSize = "27vw (desktop)";
      }
      
      let device = "Unknown";
      if (/iPhone|iPad|iPod/.test(ua)) {
        device = "iOS";
      } else if (/Android/.test(ua)) {
        device = "Android";
      } else if (/Mac/.test(ua)) {
        device = "macOS";
      } else if (/Windows/.test(ua)) {
        device = "Windows";
      }
      
      setInfo({
        width,
        height,
        device,
        userAgent: ua.substring(0, 50) + "...",
        isMobile,
        widgetSize,
      });
    };
    
    updateInfo();
    window.addEventListener('resize', updateInfo);
    return () => window.removeEventListener('resize', updateInfo);
  }, []);

  // Only show in development or with debug query param
  const showDebug = process.env.NODE_ENV === 'development' || 
                    typeof window !== 'undefined' && window.location.search.includes('debug=true');
  
  if (!showDebug) return null;

  return (
    <div className="fixed bottom-0 left-0 bg-black/80 text-white text-xs p-2 z-50 font-mono max-w-xs">
      <div>Screen: {info.width}x{info.height}</div>
      <div>Device: {info.device}</div>
      <div>Mobile: {info.isMobile ? "Yes" : "No"}</div>
      <div>Widget: {info.widgetSize}</div>
      <details>
        <summary>UA</summary>
        <div className="break-all">{info.userAgent}</div>
      </details>
    </div>
  );
}