import os
import logging
import asyncio
from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    AgentSession,
    JobContext,
    WorkerOptions,
    WorkerType,
    cli,
    tts,
)
from livekit.plugins import openai as lk_openai, simli as lk_simli
from elevenlabs.client import ElevenLabs
from elevenlabs import stream

# Minimal retrieval: load persona/kb; add to system/context each turn
PERSONA_PATH = os.path.join(os.path.dirname(__file__), "..", "kb", "persona.md")
KB_PATH = os.path.join(os.path.dirname(__file__), "..", "kb", "kb.md")

log = logging.getLogger("squatch")
logging.basicConfig(level=logging.INFO)
load_dotenv(override=True)


def load_text(p):
    try:
        with open(p, "r", encoding="utf-8") as f:
            return f.read()
    except:
        return ""


persona_txt = load_text(PERSONA_PATH)
kb_txt = load_text(KB_PATH)


async def entrypoint(ctx: JobContext):
    log.info(f"Agent starting for room: {ctx.room.name}")
    
    # OpenAI for STT + LLM
    openai_client = lk_openai.OpenAI(
        model="gpt-4o",
        instructions=persona_txt.strip() or "You are concise and helpful."
    )
    
    # Start Simli avatar session (publishes VIDEO to the room)
    simli_sess = lk_simli.AvatarSession(
        simli_config=lk_simli.SimliConfig(
            api_key=os.environ["SIMLI_API_KEY"],
            face_id=os.environ["SIMLI_FACE_ID"]
        ),
    )
    
    # Create session
    session = AgentSession(stt=lk_openai.STT(), llm=openai_client)
    
    # Start simli avatar
    await simli_sess.start(session, room=ctx.room)
    
    # ElevenLabs client for TTS
    el_client = ElevenLabs(api_key=os.environ["ELEVENLABS_API_KEY"])
    
    # Custom TTS adapter for ElevenLabs
    class ElevenLabsTTS(tts.TTS):
        def __init__(self, client, voice_id):
            super().__init__(
                streaming_supported=True,
                sample_rate=16000,
                channels=1,
            )
            self._client = client
            self._voice_id = voice_id
            
        async def synthesize(self, text: str):
            log.info(f"Synthesizing: {text[:50]}...")
            
            # Use ElevenLabs streaming
            audio_stream = self._client.generate(
                text=text,
                voice=self._voice_id,
                model="eleven_monolingual_v1",
                stream=True,
                output_format="pcm_16000",
                optimize_streaming_latency=2,
            )
            
            # Convert to LiveKit audio frames
            for chunk in audio_stream:
                if chunk:
                    # Convert bytes to audio frame
                    frame = rtc.AudioFrame.create(
                        sample_rate=16000,
                        num_channels=1,
                        samples_per_channel=len(chunk) // 2,  # 16-bit PCM
                    )
                    frame.data = chunk
                    yield frame
    
    # Configure session with ElevenLabs TTS
    eleven_tts = ElevenLabsTTS(el_client, os.environ["ELEVENLABS_VOICE_ID"])
    session._tts = eleven_tts
    
    # Add KB context to prompts
    def enhance_with_kb(text: str) -> str:
        kb_context = kb_txt[:1500] if kb_txt else ""
        return f"{persona_txt}\n\nContext:\n{kb_context}\n\nUser: {text}"
    
    # Override LLM chat to add KB
    original_chat = session._llm.chat
    async def chat_with_kb(*args, **kwargs):
        # Enhance the last user message with KB
        if args and len(args) > 0 and isinstance(args[0], list):
            messages = args[0]
            if messages and messages[-1].get("role") == "user":
                messages[-1]["content"] = enhance_with_kb(messages[-1]["content"])
        return await original_chat(*args, **kwargs)
    
    session._llm.chat = chat_with_kb
    
    # Start the agent session
    await session.start(agent=None, room=ctx.room)
    
    # Keep the worker alive
    log.info("Agent running...")
    while True:
        await asyncio.sleep(60)


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))