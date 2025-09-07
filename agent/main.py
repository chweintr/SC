import logging
import os
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    WorkerType,
    cli,
)
from livekit.plugins import openai, simli, elevenlabs, silero, deepgram

logger = logging.getLogger("simli-squatch-agent")
logger.setLevel(logging.INFO)

load_dotenv(override=True)

def load_persona():
    try:
        with open(os.path.join(os.path.dirname(__file__), "..", "kb", "persona.md"), "r") as file:
            return file.read()
    except FileNotFoundError:
        logger.warning("Persona file not found, using default")
        return "You are Squatch, a friendly Sasquatch from the Pacific Northwest. You speak with warmth, dry humor, and practical woods sense."

def load_knowledge_base():
    try:
        with open(os.path.join(os.path.dirname(__file__), "..", "kb", "kb.md"), "r") as file:
            return file.read()
    except FileNotFoundError:
        logger.warning("KB file not found, using default")
        return "I am Squatch. I live in the forests of the Pacific Northwest."

async def entrypoint(ctx: JobContext):
    logger.info("Starting Squatch Agent with Simli face and ElevenLabs voice...")
    
    # Load persona and knowledge base
    persona = load_persona()
    knowledge = load_knowledge_base()
    
    # Combine persona and knowledge into instructions
    instructions = f"{persona}\n\nWhat you know:\n{knowledge}"
    
    # Get ElevenLabs voice ID
    elevenlabs_voice_id = os.getenv("ELEVENLABS_VOICE_ID")
    if not elevenlabs_voice_id:
        logger.error("Missing ELEVENLABS_VOICE_ID")
        return
    
    # Create agent session with separate STT/LLM/TTS components
    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-3"),
        llm=openai.LLM(model="gpt-4o"),
        tts=elevenlabs.TTS(
            voice=elevenlabs_voice_id,
            model="eleven_turbo_v2_5",
        ),
    )
    
    # Simli configuration
    simliAPIKey = os.getenv("SIMLI_API_KEY")
    simliFaceID = os.getenv("SIMLI_FACE_ID")
    
    if not simliAPIKey or not simliFaceID:
        logger.error("Missing SIMLI_API_KEY or SIMLI_FACE_ID")
        return
    
    logger.info(f"Using Simli face ID: {simliFaceID}")
    logger.info(f"Using ElevenLabs voice ID: {elevenlabs_voice_id}")
    
    # Create Simli avatar
    simli_avatar = simli.AvatarSession(
        simli_config=simli.SimliConfig(
            api_key=simliAPIKey,
            face_id=simliFaceID,
        ),
    )
    
    # Start the avatar
    await simli_avatar.start(session, room=ctx.room)
    
    # Start the agent session with our instructions
    await session.start(
        agent=Agent(
            instructions=instructions,
            # Set context for the LLM
            create_context=lambda: openai.ChatContext(
                initial_messages=[
                    openai.ChatMessage.system(instructions)
                ]
            ),
        ),
        room=ctx.room,
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))