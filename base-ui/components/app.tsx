'use client';

import { Welcome } from '@/components/welcome';
import type { AppConfig } from '@/lib/types';

interface AppProps {
  appConfig: AppConfig;
}

// This is a fallback component, main functionality is now in page-based routing
export function App({ appConfig }: AppProps) {
  return (
    <div>
      <Welcome
        startButtonText={appConfig.startButtonText}
        onStartCall={() => {
          // Redirect to home page for language selection
          window.location.href = '/';
        }}
        disabled={false}
      />
    </div>
  );
}
