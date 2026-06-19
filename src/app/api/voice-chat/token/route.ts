import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST() {
  try {
    // Verify user authentication
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT token
    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Generate ephemeral token from OpenAI
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_REALTIME_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'alloy',
        instructions: `You are a friendly and helpful English conversation partner. Your role is to:
- Have natural, engaging conversations on any topic the user wants to discuss
- Be supportive, curious, and encouraging
- Ask follow-up questions to keep the conversation flowing
- Help with pronunciation, grammar, or vocabulary when asked, but don't interrupt the flow
- Adapt your speaking style to match the user's level
- Be enthusiastic and personable, like talking to a friend

Remember: This is open conversation practice. Let the user lead the topics and enjoy the chat!`,
        modalities: ['text', 'audio'],
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API Error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      clientSecret: data.client_secret.value,
      sessionId: data.id,
      expiresAt: data.client_secret.expires_at,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
