'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import { Language } from '@/lib/types';
import { Dispatch, SetStateAction } from 'react';
import { Coffee, MessageSquare, Plane } from 'lucide-react';

const SCENARIOS = [
  {
    name: 'Daily dialogues',
    icon: <MessageSquare className="h-10 w-10 text-blue-500" />,
  },
  { name: 'Food chats', icon: <Coffee className="h-10 w-10 text-orange-500" /> },
  { name: 'Travel chats', icon: <Plane className="h-10 w-10 text-green-500" /> },
];

export function ScenarioSelection({
  targetLanguage,
  setTargetLanguage,
  onScenarioSelected,
}: {
  targetLanguage: Language | undefined;
  setTargetLanguage: Dispatch<SetStateAction<Language | undefined>>;
  onScenarioSelected: (scenario: string) => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center mt-50">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            What do you want to talk about?
          </h1>
          <p className="mt-2 text-gray-600">Choose a scenario to practice.</p>
        </div>
        <div className="space-y-6">
          <Select
            onValueChange={(value) => {
              const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === value);
              if (language) setTargetLanguage(language);
            }}
            value={targetLanguage?.code}
          >
            <SelectTrigger className="mx-auto w-full max-w-xs rounded-md border-gray-300 bg-white py-3 text-gray-900">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((language) => (
                <SelectItem key={language.code} value={language.code}>
                  {language.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SCENARIOS.map((scenario) => (
              <div
                key={scenario.name}
                onClick={() => onScenarioSelected(scenario.name)}
                className="cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 text-center shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg"
              >
                <div className="flex justify-center">{scenario.icon}</div>
                <h2 className="mt-4 text-xl font-semibold text-gray-800">{scenario.name}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 