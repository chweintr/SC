export async function synthesizeSpeech({ text, streamPreferred }: { text: string; streamPreferred: boolean }) {
  // Placeholder: later we will stream ElevenLabs from server and return a signed URL or stream token
  return { kind: 'url', url: '/placeholder-audio.mp3', seconds: Math.ceil(Math.min(6, text.length / 18)) };
}


