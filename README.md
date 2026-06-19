# IELTS AI Coach 🎓

An AI-powered IELTS exam preparation platform featuring real-time voice chat, writing evaluation, speaking practice, and vocabulary building.

## ✨ Features

### 🗣️ Real-Time Voice Chat (NEW!)
- Practice English speaking with AI using OpenAI's Realtime API
- Open-ended conversations on any topic
- Low-latency WebRTC connection (~50ms)
- Live transcription of conversations
- Session history and replay

### ✍️ Writing Practice
- Submit IELTS Task 2 essays
- Get detailed feedback on task achievement, coherence, vocabulary, and grammar
- Band score estimation (5-9)
- Improvement suggestions

### 🎤 Speaking Practice
- Record speaking responses
- AI analysis of fluency, pronunciation, and grammar
- Structured feedback
- Practice with IELTS-style questions

### 📚 Vocabulary Builder
- AI-generated flashcards
- Band 7/8/9 level vocabulary
- Topic-specific word lists
- Interactive learning

### 📊 Progress Tracking
- Session history
- Performance analytics
- Personal dashboard

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- OpenAI API key (for Realtime API)
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ielts-coach
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file:
```env
MONGODB_URI=mongodb://localhost:27017
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret_key
OPENAI_REALTIME_API_KEY=your_openai_realtime_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Dashboard**: View your progress and recent activities
3. **Voice Chat**: Start a real-time voice conversation with AI
4. **Writing Practice**: Submit essays for evaluation
5. **Speaking Practice**: Record and analyze your speaking
6. **Vocabulary**: Generate and study flashcards

## 🔧 Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB
- **AI Services**: 
  - OpenAI Realtime API (voice chat)
  - Google Gemini 2.5 Flash (text analysis)
- **Authentication**: JWT
- **Styling**: Tailwind CSS
- **Real-time Audio**: WebRTC

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── api/                 # API routes
│   │   ├── voice-chat/      # Voice chat endpoints
│   │   ├── writing-task2/   # Writing evaluation
│   │   ├── speaking-questions/ # Speaking practice
│   │   └── vocab/           # Vocabulary generation
│   ├── voice-chat/          # Voice chat page
│   ├── writing/             # Writing practice page
│   ├── speaking/            # Speaking practice page
│   ├── vocab/               # Vocabulary page
│   └── progress/            # Dashboard
├── components/
│   ├── AppShell.tsx         # Main layout with navigation
│   └── VoiceChat.tsx        # Voice chat component
└── lib/
    ├── mongodb.ts           # Database connection
    ├── gemini.ts            # Gemini AI client
    ├── auth.ts              # Authentication utilities
    └── realtimeWebRTC.ts    # WebRTC client for voice chat
```

## 🔒 Security

- JWT-based authentication
- Server-side API key management
- Ephemeral tokens for voice sessions
- User data isolation
- Rate limiting on API endpoints

## 📚 Documentation

- [Voice Chat Setup Guide](./VOICE_CHAT_SETUP.md) - Detailed guide for the voice chat feature
- [Rate Limiting](./RATE_LIMITING.md) - API rate limiting information
- [Deployment Checklist](./deployment-checklist.md) - Pre-deployment tasks

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🐛 Troubleshooting

### Voice Chat Issues
- Ensure HTTPS is enabled (required for WebRTC)
- Check microphone permissions in browser
- Verify OpenAI API key has Realtime API access

### Connection Issues
- Verify MongoDB connection string
- Check API keys are correctly set
- Ensure all environment variables are configured

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- OpenAI Realtime API for voice chat capabilities
- Google Gemini for AI-powered text analysis
- Next.js team for the amazing framework
- Vercel for hosting platform

---

**Built with ❤️ for IELTS learners worldwide**
