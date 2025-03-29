import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { OfflineIndicator } from '@/components/ui/offline-indicator';
import { OfflineTutorial } from '@/components/ui/offline-tutorial';

export function SpeechToTextMode({ language }: { language: string }) {
  const [settings, setSettings] = useState({
    offlineMode: true,
    includePunctuation: true,
    autoSaveTranscriptions: false
  });

  const [transcriptOutput, setTranscriptOutput] = useState('');
  const [savedTranscripts, setSavedTranscripts] = useState<string[]>([]);
  const transcriptCount = useRef(0);
  
  const { 
    startListening, 
    stopListening, 
    transcript, 
    interimTranscript,
    listening,
    isOffline,
    error,
    resetTranscript 
  } = useSpeechRecognition(language);

  // Update the transcript output when transcript changes
  useEffect(() => {
    if (transcript) {
      setTranscriptOutput(transcript);
      
      // Highlight new content in a distinctive way
      if (settings.includePunctuation && transcript.length > 0) {
        // Check if sentence needs punctuation
        const lastChar = transcript.trim().slice(-1);
        if (!['.', '!', '?', ',', ';', ':'].includes(lastChar)) {
          // Auto-add period if it seems like a complete sentence
          if (transcript.length > 50 && /[a-zA-Z]\s*$/.test(transcript)) {
            setTranscriptOutput(transcript + '.');
          }
        }
      }
    }
  }, [transcript, settings.includePunctuation]);

  // Auto save transcriptions when enabled
  useEffect(() => {
    if (settings.autoSaveTranscriptions && transcript && !listening) {
      // Save transcript when speech recognition stops
      if (transcript.trim() && transcript.length > 3) {
        const newTranscript = {
          id: new Date().getTime(),
          text: transcript,
          timestamp: new Date().toISOString()
        };
        
        // Save to local storage for persistence
        const savedTranscripts = JSON.parse(localStorage.getItem('savedTranscripts') || '[]');
        savedTranscripts.push(newTranscript);
        localStorage.setItem('savedTranscripts', JSON.stringify(savedTranscripts));
        
        // Reset for next transcript
        transcriptCount.current += 1;
        resetTranscript();
      }
    }
  }, [listening, transcript, settings.autoSaveTranscriptions, resetTranscript]);

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
  
  const handleSaveTranscript = () => {
    if (transcriptOutput.trim()) {
      // Create a blob and download link
      const blob = new Blob([transcriptOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gradient">Speech to Text</h2>
            <p className="text-slate-500 text-sm mt-1">This mode converts speech into text in real-time.</p>
          </div>
          
          {/* Enhanced offline indicator with tutorial */}
          <OfflineIndicator 
            isOffline={isOffline}
            mode="stt"
          />
        </div>
        
        {listening && (
          <div className="bg-primary/5 p-6 flex flex-col items-center justify-center">
            <div className="relative">
              {/* Animated listening indicator */}
              <div className="flex space-x-1 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm py-1 px-3 rounded-full text-slate-700 text-xs whitespace-nowrap">
                {interimTranscript ? (
                  <span className="italic">"{interimTranscript}"</span>
                ) : (
                  <>
                    <span>Listening</span>
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
                    <span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
                  </>
                )}
              </div>
              
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
              <div className="h-20 w-20 rounded-full bg-primary/90 flex items-center justify-center relative z-10">
                <span className="material-icons text-white text-3xl">mic</span>
              </div>
            </div>
            <p className="text-primary font-medium mt-4 text-sm">
              {isOffline ? 'Offline Recognition Active' : 'Listening...'}
            </p>
          </div>
        )}
        
        <div className="p-4">
          <div className="bg-slate-50 rounded-lg p-5 min-h-40 mb-4 relative border border-slate-100">
            {transcriptOutput ? (
              <p className="text-slate-700 whitespace-pre-wrap">
                {transcriptOutput}
                {/* Show interim transcript with lighter styling */}
                {listening && interimTranscript && (
                  <span className="text-slate-400 italic">
                    {" "}{interimTranscript}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-slate-400 italic">
                {isOffline ? 
                  "Offline mode active. Basic recognition available..." :
                  "Speech transcript will appear here..."}
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
                <button 
                  className="p-1 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-500"
                  title="Save as file"
                  onClick={handleSaveTranscript}
                >
                  <span className="material-icons text-sm">download</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-3">
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
            
            {!listening && transcriptOutput && (
              <button 
                onClick={handleSaveTranscript}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200"
              >
                <span className="material-icons mr-2">save</span>
                Save Transcript
              </button>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm flex items-start">
          <span className="material-icons text-red-500 mr-2 mt-0.5">error</span>
          <div>
            <p className="font-medium">Recognition Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">settings</span>
            <h3 className="font-medium text-slate-700">Recognition Settings</h3>
          </div>
          
          {/* Help button for offline mode */}
          {isOffline && (
            <button
              onClick={() => {
                // Show offline tutorial
                const tutorialElement = document.querySelector('[data-offline-tutorial-trigger]');
                if (tutorialElement) {
                  (tutorialElement as HTMLElement).click();
                }
              }}
              className="flex items-center gap-1 text-xs py-1 px-2 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 transition-colors"
            >
              <span className="material-icons text-sm">help_outline</span>
              Offline Mode Help
            </button>
          )}
        </div>
        
        <div className="divide-y divide-slate-100">
          <SettingToggle 
            label="Enable Offline Mode"
            description="Process speech locally when network is unavailable"
            checked={settings.offlineMode}
            disabled={isOffline}
            onCheckedChange={() => handleToggleSetting('offlineMode')}
          />
          <SettingToggle 
            label="Include Punctuation"
            description="Automatically add periods and commas"
            checked={settings.includePunctuation}
            onCheckedChange={() => handleToggleSetting('includePunctuation')}
          />
          <SettingToggle 
            label="Auto-Save Transcriptions"
            description="Save completed transcriptions automatically"
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
  description,
  checked, 
  disabled = false,
  onCheckedChange 
}: { 
  label: string;
  description?: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col">
        <Label 
          htmlFor={label.replace(/\s+/g, '-').toLowerCase()} 
          className={`text-slate-700 cursor-pointer ${disabled ? 'opacity-60' : ''}`}
        >
          {label}
        </Label>
        {description && (
          <p className={`text-xs text-slate-500 mt-0.5 ${disabled ? 'opacity-60' : ''}`}>
            {description}
          </p>
        )}
      </div>
      <Switch 
        id={label.replace(/\s+/g, '-').toLowerCase()}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
