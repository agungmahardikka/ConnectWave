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

  const handleClearTranscript = () => {
    resetTranscript();
    setTranscriptOutput('');
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-xl font-bold text-gradient">Speech to Text</h2>
          <p className="text-slate-500 text-sm mt-1">This mode converts speech into text in real-time.</p>
        </div>
        
        {listening && (
          <div className="bg-primary/5 p-6 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center relative z-10">
                <span className="material-icons text-white text-3xl">mic</span>
              </div>
            </div>
            <p className="text-primary font-medium mt-4 text-sm">Listening...</p>
          </div>
        )}
        
        <div className="p-4">
          <div className="bg-slate-50 rounded-lg p-5 min-h-40 mb-4 relative border border-slate-100">
            {transcriptOutput ? (
              <p className="text-slate-700 whitespace-pre-wrap">
                {transcriptOutput}
              </p>
            ) : (
              <p className="text-slate-400 italic">
                Speech transcript will appear here...
              </p>
            )}
            
            {transcriptOutput && (
              <div className="absolute top-2 right-2 flex space-x-1">
                <button 
                  onClick={handleClearTranscript}
                  className="p-1 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500"
                  title="Clear transcript"
                >
                  <span className="material-icons text-sm">clear</span>
                </button>
                <button 
                  className="p-1 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500"
                  title="Copy to clipboard"
                  onClick={() => { navigator.clipboard.writeText(transcriptOutput) }}
                >
                  <span className="material-icons text-sm">content_copy</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            {!listening ? (
              <button 
                onClick={startListening}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary-dark hover:to-primary text-white py-3 px-6 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow"
              >
                <span className="material-icons mr-2">mic</span>
                Start Listening
              </button>
            ) : (
              <button 
                onClick={stopListening}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 px-6 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200"
              >
                <span className="material-icons mr-2">mic_off</span>
                Stop Listening
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
        <div className="flex items-center mb-3">
          <span className="material-icons text-primary mr-2">settings</span>
          <h3 className="font-medium text-slate-700">Recognition Settings</h3>
        </div>
        <div className="divide-y divide-slate-100">
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
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center">
        <Label 
          htmlFor={label.replace(/\s+/g, '-').toLowerCase()} 
          className="text-slate-600 cursor-pointer"
        >
          {label}
        </Label>
      </div>
      <Switch 
        id={label.replace(/\s+/g, '-').toLowerCase()}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
