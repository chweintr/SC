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
from livekit.plugins import openai, simli

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
    logger.info("Starting Squatch Agent with Simli face...")
    
    # Load persona and knowledge base
    persona = load_persona()
    knowledge = load_knowledge_base()
    
    # Combine persona and knowledge into instructions
    instructions = f"{persona}\n\nWhat you know:\n{knowledge}"
    
    # Create agent session with OpenAI realtime
    session = AgentSession(
        llm=openai.realtime.RealtimeModel(voice="alloy"),
    )
    
    # Simli configuration
    simliAPIKey = os.getenv("SIMLI_API_KEY")
    simliFaceID = os.getenv("SIMLI_FACE_ID")
    
    if not simliAPIKey or not simliFaceID:
        logger.error("Missing SIMLI_API_KEY or SIMLI_FACE_ID")
        return
    
    logger.info(f"Using Simli face ID: {simliFaceID}")
    
    # Create Simli avatar
    simli_avatar = simli.AvatarSession(
        simli_config=simli.SimliConfig(
            api_key=simliAPIKey,
            face_id=simliFaceID,
        ),
    )
    
    # Start the avatar
    await simli_avatar.start(session, room=ctx.room)
    
    # Start the agent session
    await session.start(
        agent=Agent(instructions=instructions),
        room=ctx.room,
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint, worker_type=WorkerType.ROOM))