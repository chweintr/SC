"use client";
import { useEffect, useMemo, useRef, useState } from 'react';

export default function HeroScene() {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [motionOk, setMotionOk] = useState(true);
  const source = useMemo(() => {
    const mq = matchMedia('(max-aspect-ratio: 3/4)');
    return mq.matches ? '/video/hero_9x16.mp4' : '/video/hero_16x9.mp4';
  }, []);
  useEffect(() => {
    setMotionOk(!matchMedia('(prefers-reduced-motion: reduce)').matches);
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


