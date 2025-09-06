"use client";
import { useEffect, useRef, useState } from 'react';

// TypeScript declaration for the Simli widget custom element
declare module 'react' {
  interface IntrinsicElements {
    'simli-widget': {
      token?: string;
      agentid?: string;
      position?: string;
      overlay?: string;
    };
  }
}

export default function HeroScene() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  const [source, setSource] = useState('/video/hero_16x9.mp4');
  const [simliToken, setSimliToken] = useState('');
  const [agentId, setAgentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  
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
    // Load Simli widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.simli.com/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const summonSasquatch = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // Step 1: Get or create agent ID
      const agentRes = await fetch('/api/simli/agent', { method: 'GET' });
      if (!agentRes.ok) throw new Error('Failed to get agent');
      const { agentId: fetchedAgentId } = await agentRes.json();
      setAgentId(fetchedAgentId);
      
      // Step 2: Get token
      const tokenRes = await fetch('/api/simli/token', { method: 'POST' });
      if (!tokenRes.ok) throw new Error('Failed to get token');
      const { token } = await tokenRes.json();
      
      setSimliToken(token);
      setShowWidget(true);
    } catch (err) {
      console.error('Failed to start Simli:', err);
      alert('Failed to summon Sasquatch. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeWidget = () => {
    setShowWidget(false);
    setSimliToken('');
    setAgentId('');
  };

  return (
    <section className="relative w-full h-full overflow-hidden bg-black">
      {motionOk && (
        <video 
          ref={bgVideoRef} 
          autoPlay 
          muted 
          loop 
          playsInline
          src={source} 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
      )}
      
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="relative" style={{ width: 'clamp(280px, 50vmin, 720px)' }}>
          {!showWidget ? (
            <div className="aspect-square overflow-hidden rounded-3xl relative bg-gradient-to-b from-amber-900/90 to-amber-950/90 flex items-center justify-center">
              <button
                onClick={summonSasquatch}
                disabled={isLoading}
                className="px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-700 disabled:opacity-50 text-black font-bold rounded-full shadow-lg transform transition hover:scale-105 disabled:scale-100"
              >
                {isLoading ? 'Summoning...' : 'Summon Sasquatch'}
              </button>
            </div>
          ) : (
            <div className="aspect-square overflow-hidden rounded-3xl relative bg-black">
              {simliToken && agentId && (
                <simli-widget
                  token={simliToken}
                  agentid={agentId}
                  position="relative"
                />
              )}
              <button
                onClick={closeWidget}
                className="absolute top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <img 
          src="/images/trees-left.png" 
          alt="" 
          className="absolute left-0 bottom-0 h-full w-auto opacity-30"
        />
        <img 
          src="/images/trees-right.png" 
          alt="" 
          className="absolute right-0 bottom-0 h-full w-auto opacity-30" 
        />
      </div>
    </section>
  );
}