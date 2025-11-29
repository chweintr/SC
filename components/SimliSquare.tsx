"use client";

import * as React from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";

export default function SimliSquare() {
  const [token, setToken] = React.useState("");
  const [serverUrl, setServerUrl] = React.useState("");
  const [isConnecting, setIsConnecting] = React.useState(false);

  // Fetch token on mount
  React.useEffect(() => {
    (async () => {
      try {
        // Default to paid tier for now as requested
        const resp = await fetch("/api/token?tier=paid");
        const data = await resp.json();
        setToken(data.token);
        setServerUrl(data.serverUrl);
      } catch (e) {
        console.error("Failed to fetch token:", e);
      }
    })();
  }, []);

  if (!token || !serverUrl) {
    return <div className="w-full h-full flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      connect={true}
      onConnected={() => setIsConnecting(false)}
      onDisconnected={() => setIsConnecting(false)}
      className="w-full h-full"
    >
      <AgentVideo />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function AgentVideo() {
  // Subscribe to the agent's video track
  const tracks = useTracks([Track.Source.Camera]);

  // Find the first camera track (usually the agent)
  const videoTrack = tracks.find(t => t.source === Track.Source.Camera);

  if (!videoTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/50">
        <p className="text-white font-bold animate-pulse">Waiting for Squatch...</p>
      </div>
    );
  }

  return (
    <VideoTrack
      trackRef={videoTrack}
      className="w-full h-full object-cover"
      // @ts-ignore
      playsInline={true}
    />
  );
}