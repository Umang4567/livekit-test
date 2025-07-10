'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import type { Language } from '@/lib/types';

export default function LanguageSelectionPage() {
  const router = useRouter();
  const [nativeLanguage, setNativeLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);

  const handleStart = () => {
    if (nativeLanguage && targetLanguage) {
      // Store selection in localStorage for the learning session
      localStorage.setItem('languageSelection', JSON.stringify({
        nativeLanguage,
        targetLanguage,
      }));
      
      // Navigate to learning session
      router.push('/learn');
    }
  };

  const isReadyToStart = nativeLanguage && targetLanguage && nativeLanguage.code !== targetLanguage.code;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">🎓 Language Learning</h1>
          <p className="text-lg text-muted-foreground">
            Choose your languages to start learning with AI
          </p>
        </div>

        {/* Language Selection Form */}
        <div className="space-y-6 p-8 border rounded-lg bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Native Language</label>
            <Select
              onValueChange={(value) => {
                const language = SUPPORTED_LANGUAGES.find(lang => lang.code === value);
                if (language) setNativeLanguage(language);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your native language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Language to Learn</label>
            <Select
              onValueChange={(value) => {
                const language = SUPPORTED_LANGUAGES.find(lang => lang.code === value);
                if (language) setTargetLanguage(language);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select language to learn" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.filter(lang => lang.code !== nativeLanguage?.code).map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {nativeLanguage && targetLanguage && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Ready to start!</strong>
                <br />
                We'll begin in <span className="font-medium">{nativeLanguage.name}</span> to assess your comfort level,
                then switch to <span className="font-medium">{targetLanguage.name}</span> for your learning session.
              </p>
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={!isReadyToStart}
            className="w-full"
            size="lg"
          >
            {isReadyToStart ? 'Start Learning Session' : 'Select Both Languages'}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Your AI tutor will help you learn step by step with voice interaction.
        </div>
      </div>
    </div>
  );
} 