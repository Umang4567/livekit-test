import { NextResponse } from 'next/server';
import { AccessToken, type AccessTokenOptions, type VideoGrant } from 'livekit-server-sdk';

// NOTE: you are expected to define the following environment variables in `.env.local`:
const API_KEY = process.env.LIVEKIT_API_KEY;
const API_SECRET = process.env.LIVEKIT_API_SECRET;
const LIVEKIT_URL = process.env.LIVEKIT_URL;

// don't cache the results
export const revalidate = 0;

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

// Handle both GET and POST requests
export async function GET() {
  return createConnection();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Onboarding data received:', {
      name: body.name,
      scenario: body.scenario,
      native_lang: body.nativeLanguage.name,
      target_lang: body.targetLanguage.name,
    });

    return createConnection(body);
  } catch (error) {
    console.error('Error parsing request body:', error);
    return createConnection();
  }
}

async function createConnection(data?: any) {
  try {
    if (LIVEKIT_URL === undefined) {
      throw new Error('LIVEKIT_URL is not defined');
    }
    if (API_KEY === undefined) {
      throw new Error('LIVEKIT_API_KEY is not defined');
    }
    if (API_SECRET === undefined) {
      throw new Error('LIVEKIT_API_SECRET is not defined');
    }

    // Generate participant token
    const participantName = data?.name ?? 'user';
    const participantIdentity = `voice_assistant_user_${Math.floor(Math.random() * 10_000)}`;

    // Include language info in room name if provided
    let roomName = `voice_assistant_room_${Math.floor(Math.random() * 10_000)}`;

    if (data?.nativeLanguage) {
      const sanitizedScenario = data.scenario.replace(/\s+/g, '');
      const sanitizedName = data.name.replace(/\s+/g, '');
      // Encode language selection in room name for agent to read
      const langInfo = `${data.nativeLanguage.code}_to_${data.targetLanguage.code}_${sanitizedScenario}_${sanitizedName}`;
      roomName = `lang_${langInfo}_${Math.floor(Math.random() * 10_000)}`;

      console.log('🔗 Room name with language info:', roomName);
      console.log('📋 Language data:', {
        native: data.nativeLanguage,
        target: data.targetLanguage,
      });
    }

    // Create token with language metadata
    const participantToken = await createParticipantToken(
      {
        identity: participantIdentity,
        name: participantName,
        // Include language data in token metadata if available
        metadata: data
          ? JSON.stringify({
              nativeLanguage: data.nativeLanguage.code,
              targetLanguage: data.targetLanguage.code,
              nativeLanguageName: data.nativeLanguage.name,
              targetLanguageName: data.targetLanguage.name,
              name: data.name,
              scenario: data.scenario,
            })
          : undefined,
      },
      roomName,
    );

    // Return connection details
    const connectionData: ConnectionDetails = {
      serverUrl: LIVEKIT_URL,
      roomName,
      participantToken: participantToken,
      participantName,
    };

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });

    return NextResponse.json(connectionData, { headers });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return new NextResponse(error.message, { status: 500 });
    }
  }
}

function createParticipantToken(userInfo: AccessTokenOptions, roomName: string) {
  const at = new AccessToken(API_KEY, API_SECRET, {
    ...userInfo,
    ttl: '15m',
  });
  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  };
  at.addGrant(grant);
  return at.toJwt();
}
