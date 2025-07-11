'use client';

import { useEffect, useMemo, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { RoomAudioRenderer, RoomContext, StartAudio } from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { SessionView } from '@/components/session-view';
import { Toaster } from '@/components/ui/sonner';
import type { AppConfig, LanguageSelection } from '@/lib/types';

interface LearningSessionPageProps {
  appConfig: AppConfig;
}

interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

export default function LearningSessionPage({ appConfig }: LearningSessionPageProps) {
  const room = useMemo(() => new Room(), []);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageSelection | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [userInfo, setUserInfo] = useState<{name: string, scenario: string} | null>(null);

  // Load language selection from localStorage
  useEffect(() => {
    const storedLanguages = localStorage.getItem('languageSelection');
    if (storedLanguages) {
      try {
        const languages = JSON.parse(storedLanguages);
        setSelectedLanguages(languages);
      } catch (error) {
        console.error('Error parsing language selection:', error);
      }
    }

    const storedUserInfo = localStorage.getItem('userInfo');
    if(storedUserInfo) {
      try {
        const info = JSON.parse(storedUserInfo);
        setUserInfo(info);
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
  }, []);

  // Get connection details with language data when languages are selected
  useEffect(() => {
    if (selectedLanguages && userInfo && !connectionDetails) {
      getConnectionDetailsWithLanguages(selectedLanguages, userInfo);
    }
  }, [selectedLanguages, userInfo, connectionDetails]);

  const getConnectionDetailsWithLanguages = async (languages: LanguageSelection, userInfo: {name: string, scenario: string}) => {
    try {
      console.log('📤 Sending language selection to backend:', languages);
      
      const response = await fetch('/api/connection-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...languages, ...userInfo }),
      });

      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }

      const details = await response.json();
      console.log('✅ Connection details received:', details);
      setConnectionDetails(details);
    } catch (error) {
      console.error('Error getting connection details:', error);
      toastAlert({
        title: 'Error getting connection details',
        description: 'Failed to prepare learning session',
      });
    }
  };

  useEffect(() => {
    const onDisconnected = () => {
      setSessionStarted(false);
      setConnectionDetails(null);
    };
    const onMediaDevicesError = (error: Error) => {
      toastAlert({
        title: 'Encountered an error with your media devices',
        description: `${error.name}: ${error.message}`,
      });
    };
    room.on(RoomEvent.MediaDevicesError, onMediaDevicesError);
    room.on(RoomEvent.Disconnected, onDisconnected);
    return () => {
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.MediaDevicesError, onMediaDevicesError);
    };
  }, [room]);

  useEffect(() => {
    if (sessionStarted && room.state === 'disconnected' && connectionDetails) {
      console.log('🔗 Connecting to room:', connectionDetails.roomName);
      
      Promise.all([
        room.localParticipant.setMicrophoneEnabled(true, undefined, {
          preConnectBuffer: appConfig.isPreConnectBufferEnabled,
        }),
        room.connect(connectionDetails.serverUrl, connectionDetails.participantToken),
      ]).catch((error) => {
        toastAlert({
          title: 'There was an error connecting to the agent',
          description: `${error.name}: ${error.message}`,
        });
      });
    }
    return () => {
      room.disconnect();
    };
  }, [room, sessionStarted, connectionDetails, appConfig.isPreConnectBufferEnabled]);

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  if (!selectedLanguages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">No Language Selection Found</h1>
          <p className="text-muted-foreground">Please go back and select your languages.</p>
          <a href="/" className="text-blue-500 hover:underline">
            Go to Language Selection
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!sessionStarted && (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-3xl font-bold">Ready to Learn!</h1>
            <div className="p-6 border rounded-lg bg-card space-y-4">
              <p className="text-lg">
                <strong>Native Language:</strong> {selectedLanguages.nativeLanguage.name}
              </p>
              <p className="text-lg">
                <strong>Learning:</strong> {selectedLanguages.targetLanguage.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Your AI tutor will start in {selectedLanguages.nativeLanguage.name} to get to know you,
                then gradually switch to {selectedLanguages.targetLanguage.name} for learning.
              </p>
              {connectionDetails && (
                <p className="text-xs text-green-600">
                  ✅ Room prepared: {connectionDetails.roomName}
                </p>
              )}
            </div>
            <button
              onClick={handleStartSession}
              disabled={!connectionDetails}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {connectionDetails ? 'Start Learning Session' : 'Preparing Session...'}
            </button>
          </div>
        </div>
      )}

      <RoomContext.Provider value={room}>
        <RoomAudioRenderer />
        <StartAudio label="Start Audio" />
        {sessionStarted && (
          <SessionView
            appConfig={appConfig}
            disabled={false}
            sessionStarted={sessionStarted}
            selectedLanguages={selectedLanguages}
          />
        )}
      </RoomContext.Provider>

      <Toaster />
    </div>
  );
} 