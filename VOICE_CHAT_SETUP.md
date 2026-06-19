# Voice Chat Feature - Setup & Usage Guide

## 🎯 Overview

The Voice Chat feature enables real-time voice conversations with an AI coach using OpenAI's Realtime API with WebRTC technology. Users can practice English speaking skills through natural, open-ended conversations on any topic.

## ✨ Key Features

- **Real-time Voice Conversation**: Low-latency (~50ms) audio streaming with WebRTC
- **Open Topic Discussion**: No restrictions - talk about anything you want
- **Live Transcription**: See your conversation transcribed in real-time
- **Session History**: All conversations are saved to your account
- **Smart Audio**: Built-in echo cancellation, noise suppression, and auto gain control
- **Responsive UI**: Works on desktop and mobile browsers

## 🔧 Technical Implementation

### Architecture

```
User Browser (WebRTC) <---> OpenAI Realtime API <---> GPT-4 Realtime Model
         |
         |
    Next.js API <---> MongoDB (Session Storage)
```

### Technology Stack

- **Frontend**: React, TypeScript, WebRTC API
- **Backend**: Next.js API Routes, OpenAI Realtime API
- **Database**: MongoDB (session storage)
- **Authentication**: JWT tokens

### Files Created

1. **Backend API Routes**:
   - `src/app/api/voice-chat/token/route.ts` - Generates ephemeral tokens
   - `src/app/api/voice-chat/sessions/route.ts` - Saves/retrieves session history

2. **Frontend Components**:
   - `src/components/VoiceChat.tsx` - Main voice chat UI
   - `src/app/voice-chat/page.tsx` - Voice chat page
   - `src/lib/realtimeWebRTC.ts` - WebRTC client library

3. **Navigation**:
   - Updated `src/components/AppShell.tsx` - Added Voice Chat to menu

## 🚀 Setup Instructions

### 1. Environment Variables

The OpenAI Realtime API key should be added to `.env.local`:

```env
OPENAI_REALTIME_API_KEY=your_openai_realtime_api_key_here
```

⚠️ **Important**: Never commit API keys to version control. Add `.env.local` to `.gitignore`.

### 2. Browser Requirements

The feature requires browsers with WebRTC support:
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+

### 3. Microphone Permissions

Users must grant microphone access when prompted by the browser.

## 📱 How to Use

### For Users

1. **Login** to your IELTS Coach account
2. Navigate to **Voice Chat** from the sidebar menu
3. Click **"Start Voice Chat"** button
4. **Allow microphone access** when prompted
5. Wait for the connection (status indicator shows "Connected")
6. **Start speaking** - the AI will respond naturally
7. View the **live transcript** as you talk
8. Click **"End Session"** when finished
9. Your conversation is automatically saved to history

### For Developers

#### Starting the Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:3000/voice-chat`

#### Testing the Feature

1. Ensure MongoDB is running locally or connected to Atlas
2. Create a test account or login
3. Navigate to Voice Chat page
4. Check browser console for WebRTC connection logs

#### Debugging

Enable detailed logging by checking the browser console:
- Connection state changes
- Data channel events
- Transcript updates
- Audio track status

## 🔒 Security Features

1. **Authentication**: JWT token required for all API calls
2. **Ephemeral Tokens**: OpenAI session tokens expire automatically
3. **Server-side API Key**: Never exposed to client
4. **Session Isolation**: Each user's conversations are private

## 💾 Database Schema

### `voice_sessions` Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,          // Reference to user
  topic: String,             // "Open conversation"
  duration: Number,          // Session length in seconds
  transcript: [              // Array of transcript items
    {
      speaker: String,       // "user" or "assistant"
      text: String,          // Spoken text
      timestamp: Number      // Unix timestamp
    }
  ],
  createdAt: Date
}
```

## 🎨 UI Components

### Status Indicators

- 🟢 **Green Pulse**: Connected and ready
- 🟡 **Yellow Pulse**: Connecting...
- 🔴 **Red**: Connection error
- ⚫ **Gray**: Disconnected

### Controls

- 🎤 **Mic Button**: Mute/unmute microphone
- 📞 **End Button**: Stop session and save
- 💬 **Transcript**: Real-time conversation history

## ⚙️ Configuration Options

### AI Voice Options

In `src/app/api/voice-chat/token/route.ts`, you can change the voice:

```typescript
voice: 'alloy'  // Options: alloy, echo, shimmer, fable, onyx, nova
```

### Voice Activity Detection (VAD)

Adjust sensitivity in the token endpoint:

```typescript
turn_detection: {
  type: 'server_vad',
  threshold: 0.5,              // 0.0 - 1.0 (higher = less sensitive)
  prefix_padding_ms: 300,      // Audio before speech starts
  silence_duration_ms: 500,    // Silence before considering speech ended
}
```

### AI Instructions

Modify the system instructions in `src/app/api/voice-chat/token/route.ts`:

```typescript
instructions: `Your custom instructions here...`
```

## 🐛 Troubleshooting

### Issue: "Microphone access denied"

**Solution**: Check browser permissions and allow microphone access.

### Issue: "Failed to create session"

**Solution**: 
- Verify the OpenAI API key is valid
- Check if the Realtime API is enabled for your account
- Ensure you have credits/quota available

### Issue: "Connection failed"

**Solution**:
- Check network connectivity
- Verify HTTPS is being used (required for WebRTC)
- Try a different browser

### Issue: No audio output

**Solution**:
- Check system volume settings
- Verify browser audio permissions
- Check if audio element is blocked by browser

### Issue: Transcript not showing

**Solution**:
- Check browser console for errors
- Verify WebSocket/DataChannel is connected
- Check OpenAI API response format

## 📊 Performance Metrics

- **Latency**: ~50ms (WebRTC) vs ~200-500ms (WebSocket)
- **Audio Quality**: 24kHz sample rate
- **Session Timeout**: 15 minutes (configurable)
- **Max Transcript Length**: Unlimited (stored in MongoDB)

## 🔄 Future Enhancements

Potential improvements:
- [ ] Multiple voice options selector in UI
- [ ] Audio recording download
- [ ] Speaking analytics (WPM, pauses, etc.)
- [ ] Topic suggestions
- [ ] Conversation summaries with AI
- [ ] Band score estimation
- [ ] Mobile app support

## 📚 Resources

- [OpenAI Realtime API Docs](https://platform.openai.com/docs/guides/realtime)
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console logs
3. Check OpenAI API status page
4. Verify environment variables are set correctly

---

**Built with ❤️ using OpenAI Realtime API, WebRTC, and Next.js**
