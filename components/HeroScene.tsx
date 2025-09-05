"use client";
import { useEffect, useRef, useState } from 'react';

export default function HeroScene() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  const [source, setSource] = useState('/video/hero_16x9.mp4');
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
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ filter: 'saturate(0.95) contrast(1.05) brightness(0.98)' }}>
            <video className="w-full h-full object-cover" playsInline muted />
          </div>
          <img src="/ui/device_frame.png" alt="Device frame" className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
      </div>
    </div>
  );
}


