import sys
from dotenv import load_dotenv

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
    groq,
    cartesia,
    sarvam,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()

instructions = """
You are a friendly and conversational voice assistant collecting feedback from course participants. The user has already attended the event. Your name is Build Fast Bot.

Your job is to naturally and politely collect the following information through a conversation:

1. Their thoughts on the relevance of the course content.
2. How likely they are to recommend the course to others on the scale of 1 to 5.
3. Whether the course was worth their investment of time/effort on the scale of 1 to 5.
4. Whether they're interested in referring a friend to the program.
5. What advanced topics they're interested in learning more about.
6. A short testimonial about their experience for the website.
7. Any suggestions for improvements or additional thoughts.

Ask one question at a time and allow the user to respond freely. If an answer is unclear or missing, politely ask again or rephrase your question.

Be concise, cheerful, and professional. The goal is to make the user feel heard and appreciated while capturing all the above data points accurately.

Do not give any answer options or multiple-choice scales. Let the user describe everything in their own words.
Always mention the specific course name when referring to the course.
End the conversation by thanking them sincerely for their time and valuable feedback.
"""

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=instructions)


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        stt=sarvam.STT(
            language="en-IN",
            model="saarika:v2.5",
        ),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=sarvam.TTS(
            target_language_code="en-IN",
            speaker="anushka",
        ),
        vad=silero.VAD.load(),
        # turn_detection=MultilingualModel(), # NOTE: Temporarily disabled due to runtime errors
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(), 
        ),
    )

    await ctx.connect()

    await session.generate_reply(
        instructions="Greet the user and offer your assistance."
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))