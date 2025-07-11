import sys
import json
import asyncio
import base64
import re
from dotenv import load_dotenv

from livekit import agents, rtc
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
    speechify,
)
from livekit.plugins.turn_detector.multilingual import MultilingualModel

load_dotenv()

# Language Learning System Prompt Generator
def generate_language_tutor_prompt(
    native_lang: str, target_lang: str, user_name: str, scenario: str
) -> str:
    return f"""
You are a friendly and intelligent AI language tutor for a user named {user_name}. IMPORTANT: You must start speaking ONLY in {native_lang}.
    Talk in excited and enthusiastic tone.
1. The user's name is **{user_name}**.
2. Their native language is **{native_lang}**.
3. They want to learn **{target_lang}**.
4. The user wants to practice conversations related to **"{scenario}"**. All lessons and practice should be focused on this topic.
5. **CRITICAL**: Start the conversation ONLY in {native_lang}. Do NOT speak English initially.
6. Begin by warmly welcoming {user_name} by name and confirming you'll help them learn {target_lang} for the "{scenario}" scenario.

Once you have greeted the user (1-2 exchanges):
- Gently introduce that you'll now start teaching them {target_lang} phrases related to "{scenario}".
- Always explain new {target_lang} phrases by translating them to {native_lang}.
- Be encouraging and patient.
- Ask them to repeat phrases for practice.
- Create role-playing situations based on the "{scenario}".
- If they struggle, simplify and repeat slower.

Rules:
- NEVER mix both languages in one sentence.
- Start ONLY in {native_lang}.
- Be clear, positive, and structured like a Duolingo tutor.
- When teaching {target_lang}, always provide {native_lang} explanations.
- Keep the conversation focused on the "{scenario}" topic.
"""

# Default instructions if no language selection is provided
default_instructions = """
You are a friendly and conversational voice assistant helping users learn languages. Your name is Language Learning Bot.

If the user hasn't selected their languages yet, ask them:
1. What is their native language?
2. What language would they like to learn?

Once you know their language preferences, become their personal language tutor and help them learn step by step.
"""

class LanguageTutorAgent(Agent):
    def __init__(self, instructions: str = default_instructions) -> None:
        super().__init__(instructions=instructions)

# Language code mapping for Sarvam TTS/STT
LANGUAGE_CODE_MAP = {
    'en': 'en-IN',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'ml': 'ml-IN',
    'kn': 'kn-IN',
    'gu': 'gu-IN',
    'mr': 'mr-IN',
    'pa': 'pa-IN',
    'bn': 'bn-IN',
    # Add fallbacks for other languages
    'es': 'en-IN',  # Spanish fallback to English
    'fr': 'en-IN',  # French fallback to English
    'de': 'en-IN',  # German fallback to English
    'it': 'en-IN',  # Italian fallback to English
    'pt': 'en-IN',  # Portuguese fallback to English
    'ru': 'en-IN',  # Russian fallback to English
    'ja': 'en-IN',  # Japanese fallback to English
    'ko': 'en-IN',  # Korean fallback to English
    'zh': 'en-IN',  # Chinese fallback to English
    'ar': 'en-IN',  # Arabic fallback to English
}

def get_sarvam_language_code(lang_code: str) -> str:
    """Convert ISO language code to Sarvam-compatible language code"""
    return LANGUAGE_CODE_MAP.get(lang_code, 'en-IN')

# templates for native language greetings
NATIVE_GREETING_TEMPLATES = {
    'en': "Hello {user_name}! I'm your personal AI language tutor. I'm excited to help you learn {target_lang_name} by practicing conversations about {scenario}. Let's get started!",
    'hi': "नमस्ते {user_name}! मैं आपका व्यक्तिगत AI भाषा शिक्षक हूं। मैं आपको {scenario} के बारे में बातचीत का अभ्यास करके {target_lang_name} सीखने में मदद करने के लिए उत्साहित हूं। चलिए शुरू करते हैं!",
    'es': "¡Hola {user_name}! Soy tu tutor personal de idiomas con IA. Estoy emocionado de ayudarte a aprender {target_lang_name} practicando conversaciones sobre {scenario}. ¡Empecemos!",
    'fr': "Bonjour {user_name} ! Je suis votre tuteur personnel de langues IA. Je suis ravi de vous aider à apprendre le {target_lang_name} en pratiquant des conversations sur {scenario}. Commençons !",
    'de': "Hallo {user_name}! Ich bin Ihr persönlicher KI-Sprachtutor. Ich freue mich darauf, Ihnen dabei zu helfen, {target_lang_name} zu lernen, indem wir Gespräche über {scenario} üben. Fangen wir an!",
    'it': "Ciao {user_name}! Sono il tuo tutor personale di lingue IA. Sono entusiasta di aiutarti a imparare l' {target_lang_name} esercitandoti in conversazioni su {scenario}. Iniziamo!",
    'pt': "Olá {user_name}! Sou seu tutor pessoal de idiomas com IA. Estou animado para ajudá-lo a aprender {target_lang_name} praticando conversas sobre {scenario}. Vamos começar!",
}


def get_native_greeting(
    lang_code: str, target_lang_name: str, user_name: str, scenario: str
) -> str:
    """Get personalized greeting in native language"""
    template = NATIVE_GREETING_TEMPLATES.get(lang_code, NATIVE_GREETING_TEMPLATES['en'])
    return template.format(
        user_name=user_name, target_lang_name=target_lang_name, scenario=scenario
    )


def extract_language_from_room_name(room_name: str) -> dict:
    """Extract language codes from room name"""
    print(f"🏠 Room name: {room_name}")
    
    if room_name.startswith('lang_'):
        try:
            # Extract language info from room name like: lang_hi_to_en_Travelchats_JohnDoe_12345
            parts = room_name.split('_')
            if len(parts) >= 6:
                native_code = parts[1]  # hi
                target_code = parts[3]  # en
                scenario_id = parts[4] # Travelchats
                name_id = parts[5] # JohnDoe
                
                # Re-add spaces for display
                scenario = re.sub(r'(?<!^)(?=[A-Z])', ' ', scenario_id)
                name = re.sub(r'(?<!^)(?=[A-Z])', ' ', name_id)
                
                print(f"📋 Extracted from room name - Native: {native_code}, Target: {target_code}, Scenario: {scenario}, Name: {name}")
                
                # Map codes to names (simplified)
                lang_names = {
                    'en': 'English', 'hi': 'Hindi', 'es': 'Spanish', 'fr': 'French',
                    'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
                    'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic',
                    'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam',
                    'kn': 'Kannada', 'gu': 'Gujarati', 'mr': 'Marathi', 'pa': 'Punjabi'
                }
                
                return {
                    'nativeLanguage': native_code,
                    'targetLanguage': target_code,
                    'nativeLanguageName': lang_names.get(native_code, native_code),
                    'targetLanguageName': lang_names.get(target_code, target_code),
                    'name': name,
                    'scenario': scenario,
                }
        except Exception as e:
            print(f"❌ Error extracting language from room name: {e}")
    
    return {}

async def wait_for_participant_with_token_metadata(room: rtc.Room, timeout: float = 10.0) -> dict:
    """Wait for a participant and try to extract language info from their token metadata"""
    start_time = asyncio.get_event_loop().time()
    
    while asyncio.get_event_loop().time() - start_time < timeout:
        # Check if we have any participants
        for participant in room.remote_participants.values():
            print(f"👤 Found participant: {participant.identity}")
            
            # Try to get metadata from participant if available
            if participant.metadata:
                try:
                    metadata = json.loads(participant.metadata)
                    if 'nativeLanguage' in metadata:
                        print(f"✅ Found language metadata in participant: {metadata}")
                        return metadata
                except json.JSONDecodeError as e:
                    print(f"❌ Error parsing participant metadata: {e}")
        
        await asyncio.sleep(0.5)
    
    print("⏰ Timeout waiting for participant metadata")
    return {}

async def entrypoint(ctx: agents.JobContext):
    print("🚀 Language Learning Agent Starting...")
    
    # Default language settings
    native_lang_code = 'en'
    target_lang_code = 'hi'
    native_lang_name = 'English'
    target_lang_name = 'Hindi'
    name = 'Friend'
    scenario = 'a general conversation'
    instructions = default_instructions

    await ctx.connect()
    
    # Method 1: Try to extract language info from room name
    room_metadata = extract_language_from_room_name(ctx.room.name)
    
    if room_metadata:
        print("✅ Using language data from room name")
        native_lang_code = room_metadata.get('nativeLanguage', 'en')
        target_lang_code = room_metadata.get('targetLanguage', 'hi')
        native_lang_name = room_metadata.get('nativeLanguageName', 'English')
        target_lang_name = room_metadata.get('targetLanguageName', 'Hindi')
        name = room_metadata.get('name', name)
        scenario = room_metadata.get('scenario', scenario)
    else:
        # Method 2: Wait for participant metadata
        print("🔍 No room metadata found, waiting for participant...")
        participant_metadata = await wait_for_participant_with_token_metadata(ctx.room, timeout=10.0)
        
        if participant_metadata:
            print("✅ Using language data from participant metadata")
            native_lang_code = participant_metadata.get('nativeLanguage', 'en')
            target_lang_code = participant_metadata.get('targetLanguage', 'hi')
            native_lang_name = participant_metadata.get('nativeLanguageName', 'English')
            target_lang_name = participant_metadata.get('targetLanguageName', 'Hindi')
            name = participant_metadata.get('name', name)
            scenario = participant_metadata.get('scenario', scenario)

    # Print final language configuration
    print("=" * 50)
    print(f"🎓 LANGUAGE LEARNING SESSION CONFIGURATION")
    print(f"👋 User Name: {name}")
    print(f"📝 Scenario: {scenario}")
    print(f"📍 Native Language: {native_lang_name} ({native_lang_code})")
    print(f"🎯 Target Language: {target_lang_name} ({target_lang_code})")
    print("=" * 50)
    
    # Generate personalized instructions
    instructions = generate_language_tutor_prompt(
        native_lang_name, target_lang_name, name, scenario
    )

    # IMPORTANT: Use native language for initial TTS and STT
    tts_lang = get_sarvam_language_code(native_lang_code)
    stt_lang = get_sarvam_language_code(native_lang_code)
    
    print(f"🔊 TTS Language: {tts_lang}")
    print(f"🎤 STT Language: {stt_lang}")

    session = AgentSession(
        stt=sarvam.STT(
            language=stt_lang,
            model="saarika:v2.5",
        ),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=sarvam.TTS(
            target_language_code=tts_lang,
            speaker="abhilash",
        ),
        vad=silero.VAD.load(),
        # turn_detection=MultilingualModel(), # NOTE: Temporarily disabled due to runtime errors
    )

    await session.start(
        room=ctx.room,
        agent=LanguageTutorAgent(instructions=instructions),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            noise_cancellation=noise_cancellation.BVC(), 
        ),
    )

    # Generate initial greeting in native language
    native_greeting = get_native_greeting(
        native_lang_code, target_lang_name, name, scenario
    )
    
    print(f"💬 Initial greeting: {native_greeting}")
    
    await session.generate_reply(
        instructions=f"Greet the user ({name}) warmly in their native language ({native_lang_name}) and tell them you are excited to start the lesson on {scenario}. Use this exact greeting: '{native_greeting}'"
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))