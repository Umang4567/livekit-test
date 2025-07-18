'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { Language } from '@/lib/types';
import { Dispatch, SetStateAction } from 'react';

export function LanguageSelection({
  nativeLanguage,
  setNativeLanguage,
  targetLanguage,
  setTargetLanguage,
  onSuccess,
}: {
  nativeLanguage: Language | undefined;
  setNativeLanguage: Dispatch<SetStateAction<Language | undefined>>;
  targetLanguage: Language | undefined;
  setTargetLanguage: Dispatch<SetStateAction<Language | undefined>>;
  onSuccess: () => void;
}) {
  const canContinue =
    nativeLanguage &&
    targetLanguage &&
    nativeLanguage.code !== targetLanguage.code;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center mt-50">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Choose Your Languages
          </h1>
          <p className="text-gray-600">
            What do you speak, and what would you like to learn?
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-gray-700">I speak...</label>
            <Select
              onValueChange={(value) => {
                const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === value);
                if (language) setNativeLanguage(language);
              }}
              value={nativeLanguage?.code}
            >
              <SelectTrigger className="w-full rounded-md border-gray-300 bg-white py-3 text-gray-900">
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
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-gray-700">I want to learn...</label>
            <Select
              onValueChange={(value) => {
                const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === value);
                if (language) setTargetLanguage(language);
              }}
              value={targetLanguage?.code}
            >
              <SelectTrigger className="w-full rounded-md border-gray-300 bg-white py-3 text-gray-900">
                <SelectValue placeholder="Select the language to learn" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.filter((l) => l.code !== nativeLanguage?.code).map(
                  (language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={onSuccess}
            disabled={!canContinue}
            className="w-full rounded-md bg-blue-600 py-3 text-lg font-semibold text-white transition-transform duration-150 ease-in-out hover:scale-105 hover:bg-blue-700 disabled:scale-100 disabled:bg-gray-500"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
} 