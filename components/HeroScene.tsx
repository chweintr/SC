"use client";
import { useEffect, useRef, useState } from 'react';
import { SimliClient } from 'simli-client';

export default function HeroScene() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const simliVideoRef = useRef<HTMLVideoElement>(null);
  const simliAudioRef = useRef<HTMLAudioElement>(null);
  const simliClientRef = useRef<SimliClient | null>(null);
  const [motionOk, setMotionOk] = useState(true);
  const [source, setSource] = useState('/video/hero_16x9.mp4');
  const [simliActive, setSimliActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
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
    // Cleanup Simli client on unmount
    return () => {
      if (simliClientRef.current) {
        simliClientRef.current.close();
        simliClientRef.current = null;
      }
    };
  }, []);

  const summonSasquatch = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    
    try {
      // Get session token from our API
      const res = await fetch('/api/simli/session', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to get session');
      const { sessionToken, iceConfig } = await res.json();
      
      // Initialize Simli client
      const simliClient = new SimliClient();
      simliClientRef.current = simliClient;
      
      // Set up event handlers
      simliClient.on('connected', () => {
        console.log('Simli connected');
        setSimliActive(true);
        setIsConnecting(false);
      });
      
      simliClient.on('disconnected', () => {
        console.log('Simli disconnected');
        setSimliActive(false);
      });
      
      simliClient.on('failed', (reason) => {
        console.error('Simli failed:', reason);
        setIsConnecting(false);
      });
      
      // Initialize with video and audio elements
      simliClient.Initialize({
        apiKey: '',
        session_token: sessionToken,
        faceID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID || '',
        handleSilence: true,
        videoRef: simliVideoRef.current!,
        audioRef: simliAudioRef.current!,
        maxSessionLength: 600,
        maxIdleTime: 60,
        enableConsoleLogs: true,
        SimliURL: '',
        maxRetryAttempts: 3,
        retryDelay_ms: 500,
        model: 'fasttalk',
      });
      
      // Start the connection with ICE servers
      await simliClient.start(iceConfig.iceServers);
      
    } catch (err) {
      console.error('Failed to start Simli session:', err);
      setIsConnecting(false);
      setSimliActive(false);
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
          {/* Simli video layer - positioned behind the frame */}
          <div className="aspect-square overflow-hidden rounded-3xl relative z-10">
            <video 
              ref={simliVideoRef}
              className={`w-full h-full object-cover transition-opacity duration-1000 ${simliActive ? 'opacity-100' : 'opacity-0'}`} 
              playsInline 
              muted 
            />
            {!simliActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-900/90 to-amber-950/90 z-20">
                <button
                  onClick={summonSasquatch}
                  disabled={isConnecting}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 disabled:opacity-50 text-black font-bold rounded-full shadow-lg transform transition hover:scale-105 disabled:scale-100"
                >
                  {isConnecting ? 'Connecting...' : 'Summon Sasquatch'}
                </button>
              </div>
            )}
          </div>
          {/* Device frame overlay - ALWAYS on top with higher z-index */}
          <div className="absolute inset-0 pointer-events-none border-8 border-amber-400/80 rounded-3xl shadow-2xl z-30" style={{
            background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.3), rgba(184, 134, 11, 0.3))',
            backdropFilter: 'blur(1px)'
          }} />
        </div>
      </div>
      
      {/* Hidden audio element for Simli */}
      <audio ref={simliAudioRef} className="hidden" />
      
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


