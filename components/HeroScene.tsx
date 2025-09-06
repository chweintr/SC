"use client";
import { useEffect, useRef, useState } from 'react';

export default function HeroScene() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const simliVideoRef = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  const [source, setSource] = useState('/video/hero_16x9.mp4');
  const [simliActive, setSimliActive] = useState(false);
  const [simliStream, setSimliStream] = useState<MediaStream | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const aspect = window.matchMedia('(max-aspect-ratio: 3/4)');
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      setSource(aspect.matches ? '/video/hero_9x16.mp4' : '/video/hero_16x9.mp4');
      setMotionOk(!motion.matches);
      const onAspect = () => setSource(aspect.matches ? '/video/hero_9x16.mp4' : '/video/hero_16x9.mp4');
      const onMotion = () => setMotionOk(!motion.matches);
      aspect.addEventListener?.('change', onAspect);
      motion.addEventListener?.('change', onMotion);
      return () => {
        aspect.removeEventListener?.('change', onAspect);
        motion.removeEventListener?.('change', onMotion);
      };
    }
  }, []);

  useEffect(() => {
    if (simliStream && simliVideoRef.current) {
      simliVideoRef.current.srcObject = simliStream;
    }
  }, [simliStream]);

  const summonSasquatch = async () => {
    setSimliActive(true);
    try {
      const res = await fetch('/api/simli/session', { method: 'POST' });
      const data = await res.json();
      console.log('Simli session:', data);
      // TODO: Initialize Simli WebRTC client with sessionToken and iceConfig
      // For now, show a placeholder message
    } catch (err) {
      console.error('Failed to start Simli session:', err);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {motionOk ? (
        <video ref={bgVideoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline poster="/video/hero_poster.jpg">
          <source src={source} type="video/mp4" />
        </video>
      ) : (
        <img src="/video/hero_poster.jpg" alt="Forest" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="relative" style={{ width: 'clamp(280px, 50vmin, 720px)' }}>
          {/* Simli video layer - will show through the device screen hole */}
          <div className="aspect-square overflow-hidden rounded-3xl">
            <video 
              ref={simliVideoRef}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${simliActive ? 'opacity-100' : 'opacity-0'}`} 
              playsInline 
              muted 
            />
            {!simliActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-900/90 to-amber-950/90">
                <button
                  onClick={summonSasquatch}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full shadow-lg transform transition hover:scale-105"
                >
                  Summon Sasquatch
                </button>
              </div>
            )}
          </div>
          {/* Device frame overlay - the screen area is transparent so Simli shows through */}
          <img src="/ui/device_frame.png" alt="Device frame" className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
      </div>
      
      {/* SVG definitions for the mask */}
      <svg className="absolute" width="0" height="0">
        <defs>
          <clipPath id="deviceScreenMask" clipPathUnits="objectBoundingBox">
            <rect x="0.05" y="0.05" width="0.9" height="0.9" rx="0.06" ry="0.06" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}


