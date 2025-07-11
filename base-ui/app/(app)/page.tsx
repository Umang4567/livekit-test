'use client';

import { Onboarding } from '@/components/pages/onboarding';
import { LanguageSelection } from '@/components/pages/language-selection';
import { ScenarioSelection } from '@/components/pages/scenario-selection';
import { Language } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type OnboardingStep =
  | 'ONBOARDING'
  | 'LANGUAGE_SELECTION'
  | 'SCENARIO_SELECTION';

export default function HomePage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('ONBOARDING');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState<Language>();
  const [targetLanguage, setTargetLanguage] = useState<Language>();

  const handleScenarioSelected = async (scenario: string) => {
    const data = {
      name: userName,
      nativeLanguage: nativeLanguage,
      targetLanguage: targetLanguage,
      scenario: scenario,
    };

    localStorage.setItem(
      'languageSelection',
      JSON.stringify({
        nativeLanguage,
        targetLanguage,
      }),
    );
    localStorage.setItem('userInfo', JSON.stringify({ name: userName, scenario }));

    // We'll let the learning-session page handle the call to connection-details
    // after it loads the data from local storage.
    router.push('/learn');
  };

  return (
    <div className="h-full w-full">
      {step === 'ONBOARDING' && (
        <Onboarding
          setUserName={setUserName}
          setUserEmail={setUserEmail}
          onSuccess={() => setStep('LANGUAGE_SELECTION')}
        />
      )}
      {step === 'LANGUAGE_SELECTION' && (
        <LanguageSelection
          nativeLanguage={nativeLanguage}
          setNativeLanguage={setNativeLanguage}
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          onSuccess={() => setStep('SCENARIO_SELECTION')}
        />
      )}
      {step === 'SCENARIO_SELECTION' && (
        <ScenarioSelection
          targetLanguage={targetLanguage}
          setTargetLanguage={setTargetLanguage}
          onScenarioSelected={handleScenarioSelected}
        />
      )}
    </div>
  );
}
