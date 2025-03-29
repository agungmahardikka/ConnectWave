import { useState } from 'react';
import { Header } from '@/components/ui/header';
import { Footer } from '@/components/ui/footer';
import { ModeTabs } from '@/components/ui/mode-tabs';
import { PhoneCallMode } from '@/components/phone-call';
import { SpeechToTextMode } from '@/components/speech-to-text';
import { TextToSpeechMode } from '@/components/text-to-speech';
import { SignLanguageMode } from '@/components/sign-language';

type Mode = 'call' | 'stt' | 'tts' | 'sign';

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>('call');
  const [language, setLanguage] = useState('en');

  // Handle mode change
  const handleModeChange = (mode: Mode) => {
    setActiveMode(mode);
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg flex flex-col">
      {/* Header with language selector */}
      <Header 
        selectedLanguage={language} 
        onLanguageChange={handleLanguageChange} 
      />
      
      {/* Mode navigation tabs */}
      <ModeTabs 
        activeMode={activeMode} 
        onModeChange={handleModeChange} 
      />
      
      {/* Active mode content */}
      {activeMode === 'call' && <PhoneCallMode language={language} />}
      {activeMode === 'stt' && <SpeechToTextMode language={language} />}
      {activeMode === 'tts' && <TextToSpeechMode language={language} />}
      {activeMode === 'sign' && <SignLanguageMode />}
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
