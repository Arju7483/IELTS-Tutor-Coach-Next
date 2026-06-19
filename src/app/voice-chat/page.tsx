import AppShell from '@/components/AppShell';
import VoiceChat from '@/components/VoiceChat';

export const metadata = {
  title: 'Voice Chat - IELTS Coach',
  description: 'Practice English speaking with real-time AI voice conversation on any topic',
};

export default function VoiceChatPage() {
  return (
    <AppShell>
      <VoiceChat />
    </AppShell>
  );
}
