import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Room } from 'livekit-client';
import type { ReceivedChatMessage, TextStreamData } from '@livekit/components-react';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
import type { AppConfig } from './types';

export const CONFIG_ENDPOINT = process.env.NEXT_PUBLIC_APP_CONFIG_ENDPOINT;

// Theme constants
export const THEME_STORAGE_KEY = 'theme-mode';
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transcriptionToChatMessage(
  textStream: TextStreamData,
  room: Room
): ReceivedChatMessage {
  return {
    id: textStream.streamInfo.id,
    timestamp: textStream.streamInfo.timestamp,
    message: textStream.text,
    from:
      textStream.participantInfo.identity === room.localParticipant.identity
        ? room.localParticipant
        : Array.from(room.remoteParticipants.values()).find(
            (p) => p.identity === textStream.participantInfo.identity
          ),
  };
}

export const getOrigin = (headers: Headers): string => {
  let proto = headers.get('x-forwarded-proto') ?? 'https';
  if (process.env.NODE_ENV === 'development') {
    proto = 'http';
  }
  const host = headers.get('x-forwarded-host') ?? headers.get('host');
  return `${proto}://${host}`;
};

export async function getAppConfig(origin?: string): Promise<AppConfig> {
  return APP_CONFIG_DEFAULTS;
}
