'use client';

import { useState, useEffect, useRef } from 'react';
import { RealtimeWebRTCClient, TranscriptItem, ConnectionStatus } from '@/lib/realtimeWebRTC';
import { Mic, MicOff, PhoneOff, MessageSquare, Loader2 } from 'lucide-react';

export default function VoiceChat() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const clientRef = useRef<RealtimeWebRTCClient | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll transcript
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  useEffect(() => {
    // Timer for session duration
    if (status === 'connected') {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  const startSession = async () => {
    try {
      setError(null);
      setStatus('connecting');

      // Check microphone permissions
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        throw new Error('Microphone access denied. Please allow microphone access to use voice chat.');
      }

      // Get ephemeral token from backend
      const token = localStorage.getItem('token');
      const response = await fetch('/api/voice-chat/token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get session token');
      }

      const { clientSecret } = await response.json();

      // Initialize WebRTC client
      const client = new RealtimeWebRTCClient();
      clientRef.current = client;

      client.onStatusChange(setStatus);
      client.onError(setError);
      client.onTranscript((item) => {
        setTranscript((prev) => [...prev, item]);
      });

      await client.connect(clientSecret);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
      setStatus('error');
    }
  };

  const endSession = async () => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      clientRef.current = null;
    }

    // Save session to history
    if (transcript.length > 0) {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/voice-chat/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            topic: 'Open conversation',
            duration,
            transcript,
          }),
        });
      } catch (err) {
        console.error('Failed to save session:', err);
      }
    }

    setTranscript([]);
    setDuration(0);
    setStatus('disconnected');
  };

  const toggleMute = () => {
    if (clientRef.current) {
      clientRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border border-primary/20 text-xs font-semibold tracking-wider uppercase text-primary mb-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Real-time Voice Chat
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
          Talk About Anything
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Practice your English speaking skills in natural, open conversations. Discuss any topic you're interested in.
        </p>
      </div>

      {/* Main Control Card */}
      <div className="glass-card p-8 rounded-3xl space-y-6">
        {/* Visual Indicator */}
        <div className="flex items-center justify-center">
          <div className={`relative ${status === 'connected' ? 'animate-pulse' : ''}`}>
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all ${
                status === 'connected'
                  ? 'border-primary bg-primary-subtle shadow-glow-primary'
                  : status === 'connecting'
                  ? 'border-yellow-500 bg-yellow-500/10'
                  : status === 'error'
                  ? 'border-rose bg-rose-subtle'
                  : 'border-dark-border bg-dark-light'
              }`}
            >
              {status === 'connecting' ? (
                <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
              ) : (
                <MessageSquare
                  className={`w-12 h-12 ${
                    status === 'connected'
                      ? 'text-primary'
                      : status === 'error'
                      ? 'text-rose'
                      : 'text-zinc-500'
                  }`}
                />
              )}
            </div>
            {status === 'connected' && (
              <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-20"></div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                status === 'connected'
                  ? 'bg-green-500 animate-pulse'
                  : status === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : status === 'error'
                  ? 'bg-red-500'
                  : 'bg-zinc-600'
              }`}
            />
            <span className="text-sm font-medium text-zinc-300">
              {status === 'connected'
                ? 'Connected - Start speaking anytime!'
                : status === 'connecting'
                ? 'Connecting to AI...'
                : status === 'error'
                ? 'Connection Error'
                : 'Ready to start'}
            </span>
          </div>

          {status === 'connected' && (
            <div className="text-3xl font-mono font-bold text-white">
              {formatDuration(duration)}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-rose-subtle border border-rose/30 text-rose text-sm">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Info Box for Disconnected State */}
        {status === 'disconnected' && !error && (
          <div className="px-6 py-4 rounded-xl bg-dark-light border border-dark-border text-zinc-300 text-sm space-y-2">
            <p className="font-semibold text-white">💡 How it works:</p>
            <ul className="space-y-1 ml-4 list-disc text-zinc-400">
              <li>Click the button below to start a voice conversation</li>
              <li>The AI will greet you and you can talk about any topic</li>
              <li>The AI responds naturally with voice and text</li>
              <li>Your conversation is transcribed in real-time</li>
            </ul>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {status === 'disconnected' || status === 'error' ? (
            <button
              onClick={startSession}
              className="px-8 py-4 rounded-full bg-primary text-dark font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic className="w-6 h-6" />
              Start Voice Chat
            </button>
          ) : status === 'connecting' ? (
            <button
              disabled
              className="px-8 py-4 rounded-full bg-primary text-dark font-bold text-lg flex items-center gap-3 opacity-50 cursor-not-allowed"
            >
              <Loader2 className="w-6 h-6 animate-spin" />
              Connecting...
            </button>
          ) : (
            <>
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted ? 'bg-rose-subtle text-rose border-2 border-rose' : 'bg-dark-light text-white border-2 border-zinc-600'
                } hover:scale-105 transition-all`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={endSession}
                className="px-8 py-4 rounded-full bg-rose text-white font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all"
              >
                <PhoneOff className="w-6 h-6" />
                End Session
              </button>
            </>
          )}
        </div>
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-display font-bold text-lg text-white">Conversation Transcript</h3>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {transcript.map((item, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  item.speaker === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                    item.speaker === 'user'
                      ? 'bg-primary text-dark rounded-br-sm'
                      : 'bg-dark-light text-white border border-dark-border rounded-bl-sm'
                  }`}
                >
                  <p className="text-xs font-bold mb-1.5 opacity-70">
                    {item.speaker === 'user' ? 'You' : 'AI Coach'}
                  </p>
                  <p className="text-sm leading-relaxed">{item.text}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
