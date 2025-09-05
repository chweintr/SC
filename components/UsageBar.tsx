"use client";
import { useEffect, useState } from 'react';

type Usage = { day: { tokensIn: number; tokensOut: number; ttsSeconds: number }; month: { tokensIn: number; tokensOut: number; ttsSeconds: number } };

export function UsageBar() {
  const [usage, setUsage] = useState<Usage | null>(null);
  useEffect(() => {
    fetch('/api/me/usage').then(async (r) => setUsage(await r.json())).catch(() => {});
  }, []);
  const daySec = usage?.day.ttsSeconds ?? 0;
  const maxDay = 8 * 60;
  const pct = Math.min(100, Math.round((daySec / maxDay) * 100));
  return (
    <div className="fixed top-0 left-0 right-0 p-2 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-black/40 text-white rounded-full px-3 py-1 text-xs backdrop-blur">
        TTS today: {Math.floor(daySec / 60)}m {daySec % 60}s · {pct}%
      </div>
    </div>
  );
}


