# Voice Chat - Quick Start Guide 🚀

## For End Users

### Starting a Voice Chat

1. **Login** to your account
2. Click **"Voice Chat"** in the sidebar menu
3. Click **"Start Voice Chat"** button
4. **Allow microphone access** when your browser asks
5. Wait for "Connected" status (green indicator)
6. **Start talking!** The AI will respond naturally
7. See your conversation transcribed in real-time below
8. Click **"End Session"** when you're done

### Tips for Best Results

- 🎧 Use headphones to prevent echo
- 🤫 Choose a quiet environment
- 🗣️ Speak clearly and naturally
- ⏸️ Use the mute button if you need a pause
- 📝 Review the transcript to see what the AI heard

### Conversation Topics

Talk about anything! Here are some ideas:
- Your hobbies and interests
- Current events and news
- Travel experiences
- Books, movies, or TV shows
- Technology and science
- Your daily routine
- Future plans and goals
- Your opinions on various topics

---

## For Developers

### Quick Setup

1. **Add API Key** to `.env.local`:
```env
OPENAI_REALTIME_API_KEY=your_key_here
```

2. **Start Development Server**:
```bash
npm run dev
```

3. **Test the Feature**:
   - Navigate to `http://localhost:3000/voice-chat`
   - Login with a test account
   - Click "Start Voice Chat"
   - Check browser console for debug logs

### Key Files

| File | Purpose |
|------|---------|
| `src/app/api/voice-chat/token/route.ts` | Generates session tokens |
| `src/app/api/voice-chat/sessions/route.ts` | Saves conversation history |
| `src/lib/realtimeWebRTC.ts` | WebRTC connection handler |
| `src/components/VoiceChat.tsx` | Main UI component |
| `src/app/voice-chat/page.tsx` | Voice chat page |

### Testing Checklist

- [ ] Microphone permission granted
- [ ] Connection status shows "Connected"
- [ ] Audio plays from AI responses
- [ ] Transcript updates in real-time
- [ ] Mute button works
- [ ] End session saves to database
- [ ] Works in Chrome/Firefox/Safari

### Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| No microphone access | Check browser permissions in settings |
| Connection fails | Verify API key and check console logs |
| No audio output | Check system volume and browser audio settings |
| Transcript empty | Check WebRTC data channel in console |
| Session not saving | Verify MongoDB connection |

### Debug Console Commands

```javascript
// Check if WebRTC is supported
console.log('WebRTC:', 'RTCPeerConnection' in window);

// Check microphone permissions
navigator.permissions.query({ name: 'microphone' })
  .then(status => console.log('Mic permission:', status.state));

// List audio devices
navigator.mediaDevices.enumerateDevices()
  .then(devices => console.log('Audio devices:', 
    devices.filter(d => d.kind === 'audioinput')));
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_REALTIME_API_KEY` | ✅ Yes | OpenAI Realtime API key |
| `MONGODB_URI` | ✅ Yes | MongoDB connection string |
| `JWT_SECRET` | ✅ Yes | JWT signing secret |
| `GEMINI_API_KEY` | ✅ Yes | For other features |

### API Endpoints

#### POST `/api/voice-chat/token`
**Purpose**: Generate ephemeral session token  
**Auth**: Required (JWT in Authorization header)  
**Response**: 
```json
{
  "clientSecret": "string",
  "sessionId": "string",
  "expiresAt": "number"
}
```

#### GET `/api/voice-chat/sessions`
**Purpose**: Fetch user's conversation history  
**Auth**: Required  
**Response**: Array of session objects

#### POST `/api/voice-chat/sessions`
**Purpose**: Save completed conversation  
**Auth**: Required  
**Body**:
```json
{
  "topic": "string",
  "duration": "number",
  "transcript": [
    {
      "speaker": "user|assistant",
      "text": "string",
      "timestamp": "number"
    }
  ]
}
```

### Customization Options

#### Change AI Voice
In `src/app/api/voice-chat/token/route.ts`:
```typescript
voice: 'alloy' // Options: alloy, echo, shimmer, fable, onyx, nova
```

#### Adjust Voice Detection Sensitivity
```typescript
turn_detection: {
  threshold: 0.5,          // 0-1 (lower = more sensitive)
  silence_duration_ms: 500 // Milliseconds of silence to detect end
}
```

#### Modify AI Personality
Edit the `instructions` field in the token endpoint to customize how the AI responds.

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Set `OPENAI_REALTIME_API_KEY` in production environment
- [ ] Ensure MongoDB is accessible from production
- [ ] Enable HTTPS (required for WebRTC)
- [ ] Set up rate limiting for token endpoint
- [ ] Configure CORS if needed
- [ ] Test on multiple browsers
- [ ] Add error logging/monitoring

### Performance Considerations

- Session tokens expire after 15 minutes
- Consider implementing connection pooling
- Monitor OpenAI API usage and costs
- Set up alerts for failed connections
- Cache static assets aggressively

### Security Notes

- API keys are never exposed to client
- JWT tokens validate all requests
- Session tokens are ephemeral and short-lived
- User conversations are isolated by userId
- Consider adding rate limiting per user

---

## Support & Resources

- **Full Documentation**: See [VOICE_CHAT_SETUP.md](./VOICE_CHAT_SETUP.md)
- **OpenAI Docs**: https://platform.openai.com/docs/guides/realtime
- **WebRTC Guide**: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API
- **Browser Compatibility**: https://caniuse.com/rtcpeerconnection

---

**Ready to chat? Let's go! 🎉**
