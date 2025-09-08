"use client";
import { Room, RoomEvent, RemoteParticipant, VideoTrack } from "livekit-client";
import * as React from "react";

export default function SimliSquare() {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    let room: Room | null = null;
    (async () => {
      const res = await fetch("/api/livekit/token", { method: "POST", body: JSON.stringify({ room: "squatch" }) });
      if (!res.ok) { console.error("Token error", await res.text()); return; }
      const { token, url } = await res.json();

      room = new Room();
      await room.connect(url, token);

      const attach = (track?: VideoTrack) => {
        if (track && videoRef.current) track.attach(videoRef.current);
      };

      room.on(RoomEvent.TrackSubscribed, (_t, pub) => {
        if (pub.kind === "video") attach(pub.videoTrack as VideoTrack);
      });

      // In case the avatar publishes before we subscribe:
      for (const p of room.remoteParticipants.values()) {
        for (const pub of p.videoTrackPublications.values()) {
          if (pub.isSubscribed && pub.videoTrack) {
            attach(pub.videoTrack);
          }
        }
      }
    })();

    return () => { room?.disconnect(); };
  }, []);

  return <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />;
}