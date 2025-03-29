import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SpeechToTextMode({ language }: { language: string }) {
  const [settings, setSettings] = useState({
    offlineMode: true,
    includePunctuation: true,
    autoSaveTranscriptions: false
  });

  const [transcriptOutput, setTranscriptOutput] = useState('');
  
  const { 
    startListening, 
    stopListening, 
    transcript, 
    listening,
    resetTranscript 
  } = useSpeechRecognition(language);

  // Update the transcript output when transcript changes
  useEffect(() => {
    if (transcript) {
      setTranscriptOutput(transcript);
    }
  }, [transcript]);

  const handleToggleSetting = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="flex-1 flex flex-col p-5">
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="text-xl font-bold text-neutral-600 mb-2">Speech to Text</h2>
        <p className="text-neutral-400 mb-4">This mode converts speech into text. Press the button below and speak clearly.</p>
        
        {listening && (
          <div className="bg-neutral-100 rounded-lg p-4 mb-4 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center animate-pulse mb-2">
              <span className="material-icons text-white text-2xl">mic</span>
            </div>
          </div>
        )}
        
        <div className="bg-neutral-100 rounded-lg p-4 min-h-32 mb-4">
          <p className="text-neutral-600">
            {transcriptOutput || "Speech transcript will appear here..."}
          </p>
        </div>
        
        <div className="flex justify-center">
          {!listening ? (
            <button 
              onClick={startListening}
              className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
            >
              <span className="material-icons mr-2">mic</span>
              Start Listening
            </button>
          ) : (
            <button 
              onClick={stopListening}
              className="bg-error hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
            >
              <span className="material-icons mr-2">mic_off</span>
              Stop Listening
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-medium text-neutral-600 mb-2">Speech Recognition Settings</h3>
        <div className="space-y-3">
          <SettingToggle 
            label="Enable Offline Mode"
            checked={settings.offlineMode}
            onCheckedChange={() => handleToggleSetting('offlineMode')}
          />
          <SettingToggle 
            label="Include Punctuation"
            checked={settings.includePunctuation}
            onCheckedChange={() => handleToggleSetting('includePunctuation')}
          />
          <SettingToggle 
            label="Auto-Save Transcriptions"
            checked={settings.autoSaveTranscriptions}
            onCheckedChange={() => handleToggleSetting('autoSaveTranscriptions')}
          />
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ 
  label, 
  checked, 
  onCheckedChange 
}: { 
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={label.replace(/\s+/g, '-').toLowerCase()}>{label}</Label>
      <Switch 
        id={label.replace(/\s+/g, '-').toLowerCase()}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
