export type TranscriptItem = {
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: number;
};

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class RealtimeWebRTCClient {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private onTranscriptCallback?: (item: TranscriptItem) => void;
  private onStatusCallback?: (status: ConnectionStatus) => void;
  private onErrorCallback?: (error: string) => void;
  private pendingTranscript: { speaker: 'user' | 'assistant'; text: string } = {
    speaker: 'assistant',
    text: '',
  };

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.autoplay = true;
  }

  async connect(ephemeralToken: string) {
    try {
      this.onStatusCallback?.('connecting');

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up audio element for receiving AI voice
      this.pc.ontrack = (event) => {
        if (this.audioElement) {
          this.audioElement.srcObject = event.streams[0];
        }
      };

      // Handle connection state changes
      this.pc.onconnectionstatechange = () => {
        console.log('Connection state:', this.pc?.connectionState);
        if (this.pc?.connectionState === 'connected') {
          this.onStatusCallback?.('connected');
        } else if (this.pc?.connectionState === 'failed') {
          this.onStatusCallback?.('error');
          this.onErrorCallback?.('Connection failed');
        }
      };

      // Create data channel for events/transcripts
      this.dc = this.pc.createDataChannel('oai-events');
      this.dc.onopen = () => {
        console.log('Data channel opened');
      };
      this.dc.onmessage = (event) => this.handleDataChannelMessage(event);
      this.dc.onerror = (error) => {
        console.error('Data channel error:', error);
      };

      // Get user microphone
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        },
      });

      // Add audio track to peer connection
      this.localStream.getTracks().forEach((track) => {
        this.pc!.addTrack(track, this.localStream!);
      });

      // Create and set local description (offer)
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Send offer to OpenAI and get answer
      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-12-17';
      const response = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ephemeralToken}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.statusText}`);
      }

      // Set remote description (answer from OpenAI)
      const answerSdp = await response.text();
      await this.pc.setRemoteDescription({
        type: 'answer',
        sdp: answerSdp,
      });

      console.log('WebRTC connection established');
    } catch (error) {
      console.error('Connection error:', error);
      this.onStatusCallback?.('error');
      this.onErrorCallback?.(error instanceof Error ? error.message : 'Connection failed');
      throw error;
    }
  }

  private handleDataChannelMessage(event: MessageEvent) {
    try {
      const message = JSON.parse(event.data);
      console.log('Received message:', message.type);

      // Handle different event types from OpenAI
      switch (message.type) {
        case 'session.created':
          console.log('Session created:', message.session);
          break;

        case 'conversation.item.created':
          if (message.item?.type === 'message') {
            const speaker = message.item.role === 'user' ? 'user' : 'assistant';
            
            // Check for text content
            if (message.item.content) {
              for (const content of message.item.content) {
                if (content.type === 'text' && content.text) {
                  this.onTranscriptCallback?.({
                    speaker,
                    text: content.text,
                    timestamp: Date.now(),
                  });
                }
              }
            }
          }
          break;

        case 'response.audio_transcript.delta':
          // Accumulate transcript deltas
          this.pendingTranscript.text += message.delta;
          break;

        case 'response.audio_transcript.done':
          // Flush complete transcript
          if (this.pendingTranscript.text) {
            this.onTranscriptCallback?.({
              speaker: 'assistant',
              text: this.pendingTranscript.text,
              timestamp: Date.now(),
            });
            this.pendingTranscript.text = '';
          }
          break;

        case 'conversation.item.input_audio_transcription.completed':
          // User's speech transcription
          if (message.transcript) {
            this.onTranscriptCallback?.({
              speaker: 'user',
              text: message.transcript,
              timestamp: Date.now(),
            });
          }
          break;

        case 'input_audio_buffer.speech_started':
          console.log('User started speaking');
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('User stopped speaking');
          break;

        case 'response.done':
          console.log('Response completed');
          break;

        case 'error':
          console.error('Realtime API error:', message.error);
          this.onErrorCallback?.(message.error?.message || 'Unknown error');
          break;
      }
    } catch (error) {
      console.error('Failed to parse data channel message:', error);
    }
  }

  sendMessage(text: string) {
    if (this.dc && this.dc.readyState === 'open') {
      const message = {
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text,
            },
          ],
        },
      };
      this.dc.send(JSON.stringify(message));

      // Trigger response generation
      this.dc.send(JSON.stringify({ type: 'response.create' }));
    }
  }

  setMuted(muted: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !muted;
      });
    }
  }

  disconnect() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    if (this.audioElement) {
      this.audioElement.srcObject = null;
    }
    this.onStatusCallback?.('disconnected');
  }

  onTranscript(callback: (item: TranscriptItem) => void) {
    this.onTranscriptCallback = callback;
  }

  onStatusChange(callback: (status: ConnectionStatus) => void) {
    this.onStatusCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }
}
