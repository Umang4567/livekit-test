import sys
import json
import asyncio
import base64
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
def generate_language_tutor_prompt(native_lang: str, target_lang: str) -> str:
    return f"""
You are a friendly and intelligent AI language tutor. IMPORTANT: You must start speaking ONLY in {native_lang}.
    Talk in excited and enthusiastic tone.
1. The user's **native language is {native_lang}**.
2. They want to learn **{target_lang}**.
3. **CRITICAL**: Start the conversation ONLY in {native_lang}. Do NOT speak English initially.
4. Begin by asking the user's name, their motivation for learning {target_lang}, and if they've learned it before.
5. Use **{native_lang}** EXCLUSIVELY in this initial phase to ensure user comfort.

Once you understand their background and skill level (after 3-4 exchanges):
- Gently introduce that you'll now start teaching them {target_lang}
- Begin with simple greetings and self-introduction phrases in {target_lang}
- Always explain new {target_lang} phrases by translating them to {native_lang}
- Be encouraging and patient
- Ask them to repeat phrases for practice
- If they struggle, simplify and repeat slower

Rules:
- NEVER mix both languages in one sentence
- Start ONLY in {native_lang}
- Be clear, positive, and structured like a Duolingo tutor
- When teaching {target_lang}, always provide {native_lang} explanations
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

# Native language greetings
NATIVE_GREETINGS = {
    'en': "Hello! I'm your personal AI language tutor. I'm excited to help you learn a new language today. Let's start by getting to know each other. What's your name?",
    'hi': "नमस्ते! मैं आपका व्यक्तिगत AI भाषा शिक्षक हूं। आज आपको नई भाषा सिखाने के लिए मैं बहुत उत्साहित हूं। चलिए एक दूसरे को जानते हैं। आपका नाम क्या है?",
    'es': "¡Hola! Soy tu tutor personal de idiomas con IA. Estoy emocionado de ayudarte a aprender un nuevo idioma hoy. Empecemos conociéndonos. ¿Cuál es tu nombre?",
    'fr': "Bonjour ! Je suis votre tuteur personnel de langues IA. Je suis ravi de vous aider à apprendre une nouvelle langue aujourd'hui. Commençons par faire connaissance. Quel est votre nom ?",
    'de': "Hallo! Ich bin Ihr persönlicher KI-Sprachtutor. Ich freue mich darauf, Ihnen heute dabei zu helfen, eine neue Sprache zu lernen. Lassen Sie uns damit beginnen, uns kennenzulernen. Wie heißen Sie?",
    'it': "Ciao! Sono il tuo tutor personale di lingue IA. Sono entusiasta di aiutarti a imparare una nuova lingua oggi. Iniziamo conoscendoci. Come ti chiami?",
    'pt': "Olá! Sou seu tutor pessoal de idiomas com IA. Estou animado para ajudá-lo a aprender um novo idioma hoje. Vamos começar nos conhecendo. Qual é o seu nome?",
}

def get_native_greeting(lang_code: str, target_lang_name: str) -> str:
    """Get greeting in native language"""
    greeting = NATIVE_GREETINGS.get(lang_code, NATIVE_GREETINGS['en'])
    return greeting

def extract_language_from_room_name(room_name: str) -> dict:
    """Extract language codes from room name"""
    print(f"🏠 Room name: {room_name}")
    
    if room_name.startswith('lang_'):
        try:
            # Extract language info from room name like: lang_hi_to_en_12345
            parts = room_name.split('_')
            if len(parts) >= 4:
                native_code = parts[1]  # hi
                target_code = parts[3]  # en
                
                print(f"📋 Extracted from room name - Native: {native_code}, Target: {target_code}")
                
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
                    'targetLanguageName': lang_names.get(target_code, target_code)
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

    # Print final language configuration
    print("=" * 50)
    print(f"🎓 LANGUAGE LEARNING SESSION CONFIGURATION")
    print(f"📍 Native Language: {native_lang_name} ({native_lang_code})")
    print(f"🎯 Target Language: {target_lang_name} ({target_lang_code})")
    print("=" * 50)
    
    # Generate personalized instructions
    instructions = generate_language_tutor_prompt(native_lang_name, target_lang_name)

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
    native_greeting = get_native_greeting(native_lang_code, target_lang_name)
    
    print(f"💬 Initial greeting: {native_greeting}")
    
    await session.generate_reply(
        instructions=f"Greet the user warmly in their native language ({native_lang_name}). Use this exact greeting: '{native_greeting}'"
    )


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))