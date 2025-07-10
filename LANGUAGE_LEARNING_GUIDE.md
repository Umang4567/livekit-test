# 🎓 AI Language Tutor - Usage Guide

## Overview
Your LiveKit app has been transformed into an AI Language Tutor that helps users learn new languages through voice interaction using:

- **OpenAI GPT-4** for intelligent conversation
- **Sarvam AI** for Speech-to-Text (STT) and Text-to-Speech (TTS)
- **LiveKit** for real-time voice communication

## How It Works

### 1. Language Selection 🌍
- Users first select their **native language** (what they speak fluently)
- Then choose their **target language** (what they want to learn)
- The system supports 20+ languages including English, Hindi, Spanish, French, German, and many Indian languages

### 2. Two-Phase Learning 📚

#### Phase 1: Assessment (Native Language)
- The AI tutor starts speaking in the user's native language
- Asks about their name, motivation, and previous experience
- This ensures the user is comfortable before switching languages

#### Phase 2: Teaching (Target Language)
- Gradually switches to the target language
- Starts with simple phrases like greetings and introductions
- Provides explanations in the native language when needed
- Encourages repetition and practice

## Supported Languages

The system currently supports:
- **English** (en)
- **Hindi** (hi) - हिंदी
- **Spanish** (es) - Español
- **French** (fr) - Français
- **German** (de) - Deutsch
- **Italian** (it) - Italiano
- **Portuguese** (pt) - Português
- **Russian** (ru) - Русский
- **Japanese** (ja) - 日本語
- **Korean** (ko) - 한국어
- **Chinese** (zh) - 中文
- **Arabic** (ar) - العربية
- **Bengali** (bn) - বাংলা
- **Tamil** (ta) - தமிழ்
- **Telugu** (te) - తెలుగు
- **Malayalam** (ml) - മലയാളം
- **Kannada** (kn) - ಕನ್ನಡ
- **Gujarati** (gu) - ગુજરાતી
- **Marathi** (mr) - मराठी
- **Punjabi** (pa) - ਪੰਜਾਬੀ

## Running the Application

### Frontend (Next.js)
```bash
cd base-ui
npm install
npm run dev
```

### Backend (Python Agent)
```bash
cd base-backend
pip install -r requirements.txt
python agent.py
```

## Environment Variables Required

Create `.env` files with:

**base-ui/.env.local:**
```
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

**base-backend/.env:**
```
LIVEKIT_URL=your_livekit_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key
SARVAM_API_KEY=your_sarvam_key
```

## Features

### ✅ What's Implemented
- Language selection UI with 20+ supported languages
- Dynamic system prompts based on selected languages
- Two-phase learning approach (native → target language)
- Real-time voice interaction
- Sarvam STT/TTS integration for Indian languages
- OpenAI GPT-4 for intelligent tutoring

### 🚀 Future Enhancements
- Progress tracking and learning analytics
- Lesson structure and curriculum
- Pronunciation feedback
- Language switching during conversation
- Multiple tutor personalities
- Gamification elements (XP, badges, streaks)

## User Flow

1. **Visit the app** → See language selection screen
2. **Choose languages** → Select native and target languages
3. **Start session** → Click "Start Learning Session"
4. **Assessment phase** → AI talks in native language, learns about user
5. **Teaching phase** → AI switches to target language and starts teaching
6. **Interactive learning** → User practices speaking, AI provides feedback

## Technical Architecture

```
Frontend (Next.js) → LiveKit Room → Python Agent
                                      ↓
                              OpenAI GPT-4 ← Sarvam STT/TTS
```

The agent receives language selection via participant metadata and dynamically configures:
- System prompts for appropriate teaching approach
- STT/TTS language settings
- Conversation flow and teaching methodology

## Customization

You can customize the learning experience by:
- Modifying prompts in `lib/types.ts` (`generateLanguageTutorPrompt`)
- Adding new languages to `SUPPORTED_LANGUAGES` in `lib/utils.ts`
- Updating teaching methodology in the agent prompt
- Adding new UI components for progress tracking

---

**Happy Learning! 🎉** 