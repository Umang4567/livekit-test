import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useState } from 'react';

export function Onboarding({
  setUserName,
  setUserEmail,
  onSuccess,
}: {
  setUserName: Dispatch<SetStateAction<string>>;
  setUserEmail: Dispatch<SetStateAction<string>>;
  onSuccess: () => void;
}) {
  const [localUserName, setLocalUserName] = useState('');
  const [localUserEmail, setLocalUserEmail] = useState('');
  const [error, setError] = useState('');

  const canContinue = localUserName.length > 0 && localUserEmail.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canContinue) {
      setUserName(localUserName);
      setUserEmail(localUserEmail);
      onSuccess();
    } else {
      setError('Please fill out all fields.');
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center mt-50 ">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome</h1>
          <p className="mt-2 text-gray-400">Let's get you set up for your language journey.</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-lg bg-gray-800/50 p-8 shadow-2xl"
        >
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-300">
              Your Name
            </label>
            <input
              id="username"
              type="text"
              value={localUserName}
              onChange={(e) => setLocalUserName(e.target.value)}
              className="w-full rounded-md border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              value={localUserEmail}
              onChange={(e) => setLocalUserEmail(e.target.value)}
              className="w-full rounded-md border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., jane.doe@example.com"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={!canContinue}
            className="w-full rounded-md bg-blue-600 py-3 text-lg font-semibold text-white transition-transform duration-150 ease-in-out hover:scale-105 hover:bg-blue-700 disabled:scale-100 disabled:bg-gray-700"
          >
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
} 