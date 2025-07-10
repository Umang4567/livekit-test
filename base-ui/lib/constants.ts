import type { Language } from './types';

// Supported Languages for Language Learning
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
];

export const getLanguageByCode = (code: string): Language | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getLanguageName = (code: string): string => {
  const language = getLanguageByCode(code);
  return language ? language.name : code;
};

// Language Learning System Prompt Generator
export const generateLanguageTutorPrompt = (nativeLang: string, targetLang: string) => `
You are a friendly and intelligent AI language tutor.

1. The user's **native language is ${nativeLang}**.
2. They want to learn **${targetLang}**.
3. Start the conversation in **${nativeLang}**.
4. Begin by asking the user's name, their motivation for learning ${targetLang}, and if they've learned it before.
5. Use **${nativeLang}** only in this phase to ensure user comfort.

Once you understand their background and skill level:
- Gently switch to **${targetLang}**.
- Start with simple greetings, self-introduction phrases, and vocabulary (e.g., "Hello", "My name is...").
- Explain the phrases in **${nativeLang}** if the user seems confused.
- Keep the tone encouraging and patient.
- Repeat phrases for practice and ask the user to say them aloud.
- If the user struggles, simplify further and repeat slower.

Never mix both languages in one sentence unless absolutely needed. Be clear, positive, and structured like a Duolingo tutor.
`; 