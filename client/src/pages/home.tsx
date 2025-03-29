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
    <div className="max-w-xl mx-auto bg-gradient-to-b from-slate-50 to-white min-h-screen shadow-xl flex flex-col relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-primary/5 -z-10 opacity-50">
        <div className="absolute inset-0 bg-grid-slate-200/50"></div>
      </div>
      
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
      <div className="flex-1 overflow-y-auto pb-2">
        {activeMode === 'call' && <PhoneCallMode language={language} />}
        {activeMode === 'stt' && <SpeechToTextMode language={language} />}
        {activeMode === 'tts' && <TextToSpeechMode language={language} />}
        {activeMode === 'sign' && <SignLanguageMode />}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
