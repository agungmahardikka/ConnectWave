import { useState, useEffect } from 'react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { OfflineIndicator, useOfflineStatus } from '@/components/ui/offline-indicator';

type SavedPhrase = {
  id: number;
  text: string;
};

export function TextToSpeechMode({ language }: { language: string }) {
  const [text, setText] = useState('');
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voiceType: 'female',
    preferredVoice: '',
    autoRespond: false,
    responseDelay: 0
  });
  
  // Track online/offline status
  const isOffline = useOfflineStatus();
  
  // Track whether advanced options are shown
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const { speak, voices, speaking, cancel } = useSpeechSynthesis(language);

  // Get saved phrases
  const { data: savedPhrases = [] } = useQuery<SavedPhrase[]>({
    queryKey: ['/api/phrases'],
  });

  // Save phrase mutation
  const saveMutation = useMutation({
    mutationFn: async (phraseText: string) => {
      return await apiRequest('POST', '/api/phrases', { 
        text: phraseText,
        category: 'custom',
        userId: 1 // Using a default user ID for now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
    }
  });

  // Delete phrase mutation
  const deleteMutation = useMutation({
    mutationFn: async (phraseId: number) => {
      return await apiRequest('DELETE', `/api/phrases/${phraseId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/phrases'] });
    }
  });

  // Update a single voice setting
  const updateVoiceSetting = (key: keyof typeof voiceSettings, value: any) => {
    setVoiceSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Speak text with current voice settings
  const handleSpeak = () => {
    if (speaking) {
      cancel();
      return;
    }
    
    if (text.trim()) {
      speak(text, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        volume: voiceSettings.volume,
        voice: getSelectedVoice()
      });
    }
  };

  const handleSavePhrase = () => {
    if (text.trim()) {
      saveMutation.mutate(text);
      // Clear the text after saving
      setText('');
      
      // Auto-respond if enabled
      if (voiceSettings.autoRespond) {
        const randomResponses = [
          "I've saved that phrase for you.",
          "Your phrase has been saved.",
          "Phrase added to your saved collection.",
          "That's been stored in your phrases.",
          "I've added that to your saved phrases."
        ];
        const response = randomResponses[Math.floor(Math.random() * randomResponses.length)];
        
        // Delay the response if a delay is set
        if (voiceSettings.responseDelay > 0) {
          setTimeout(() => {
            speak(response, {
              rate: voiceSettings.rate,
              pitch: voiceSettings.pitch,
              volume: voiceSettings.volume,
              voice: getSelectedVoice()
            });
          }, voiceSettings.responseDelay * 1000);
        } else {
          speak(response, {
            rate: voiceSettings.rate,
            pitch: voiceSettings.pitch,
            volume: voiceSettings.volume,
            voice: getSelectedVoice()
          });
        }
      }
    }
  };

  const handleDeletePhrase = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSpeakSavedPhrase = (phraseText: string) => {
    if (speaking) {
      cancel();
      return;
    }
    
    speak(phraseText, {
      rate: voiceSettings.rate,
      pitch: voiceSettings.pitch,
      volume: voiceSettings.volume,
      voice: getSelectedVoice()
    });
  };

  // Get the selected voice based on preferences
  const getSelectedVoice = () => {
    const voiceOptions = voices.filter(voice => 
      voice.lang.startsWith(language) || voice.lang.startsWith(language.split('-')[0])
    );
    
    // If user has selected a specific voice by name, use that
    if (voiceSettings.preferredVoice) {
      const preferredVoice = voices.find(v => v.name === voiceSettings.preferredVoice);
      if (preferredVoice) return preferredVoice;
    }
    
    // Otherwise use gender preference
    if (voiceSettings.voiceType === 'male') {
      return voiceOptions.find(voice => !voice.name.includes('Female')) || null;
    } else {
      return voiceOptions.find(voice => voice.name.includes('Female')) || null;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gradient">Text to Speech</h2>
            <p className="text-slate-500 text-sm mt-1">Type text below and it will be spoken aloud.</p>
          </div>
          
          {/* Add the offline indicator component */}
          <OfflineIndicator 
            isOffline={isOffline}
            mode="tts"
          />
        </div>
        
        <div className="p-4">
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type what you want to say..." 
            className="w-full border border-slate-200 rounded-xl p-4 min-h-32 mb-4 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 placeholder:text-slate-400 resize-none"
          />
          
          <div className="flex gap-3 mb-5">
            <button 
              onClick={handleSpeak}
              className={`flex-1 ${
                speaking 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500' 
                  : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary-dark hover:to-primary'
              } text-white py-3 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow`}
            >
              <span className="material-icons mr-2">{speaking ? 'stop' : 'volume_up'}</span>
              {speaking ? 'Stop' : 'Speak'}
            </button>
            <button 
              onClick={handleSavePhrase}
              disabled={text.trim() === ''}
              className="flex-1 bg-gradient-to-r from-slate-100 to-white text-slate-700 border border-slate-200 py-3 rounded-full font-medium flex items-center justify-center shadow-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300"
            >
              <span className="material-icons mr-2">bookmark_add</span>
              Save Phrase
            </button>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex flex-wrap items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-icons text-primary">settings</span>
                <h3 className="font-medium text-slate-700">Voice Settings</h3>
              </div>
              
              <button 
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center gap-1 text-xs py-1 px-2 bg-white text-slate-600 rounded border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <span className="material-icons text-sm">{showAdvancedOptions ? 'expand_less' : 'expand_more'}</span>
                {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </button>
            </div>
            
            {/* Basic voice options always visible */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-3">
              <div className="flex items-center min-w-32">
                <span className="text-primary mr-2"><span className="material-icons text-sm">record_voice_over</span></span>
                <div className="flex items-center">
                  <span className="text-slate-600 text-sm mr-2">Voice:</span>
                  <select 
                    value={voiceSettings.voiceType}
                    onChange={(e) => updateVoiceSetting('voiceType', e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-1.5 text-sm text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="female">Female (Default)</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center flex-1 min-w-40">
                <span className="text-primary mr-2"><span className="material-icons text-sm">speed</span></span>
                <span className="text-slate-600 text-sm mr-2">Speed: {voiceSettings.rate.toFixed(1)}x</span>
                <div className="w-full max-w-36">
                  <Slider 
                    value={[voiceSettings.rate]} 
                    min={0.5} 
                    max={2} 
                    step={0.1}
                    onValueChange={(values) => updateVoiceSetting('rate', values[0])}
                    className="mt-0.5"
                  />
                </div>
              </div>
            </div>
            
            {/* Advanced options */}
            {showAdvancedOptions && (
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h4 className="text-sm font-medium text-slate-600 mb-2">Advanced Voice Controls</h4>
                
                {/* Pitch control */}
                <div className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-slate-600 text-sm">Pitch: {voiceSettings.pitch.toFixed(1)}</span>
                  </div>
                  <div className="flex-1">
                    <Slider 
                      value={[voiceSettings.pitch]} 
                      min={0.5} 
                      max={2} 
                      step={0.1}
                      onValueChange={(values) => updateVoiceSetting('pitch', values[0])}
                    />
                  </div>
                </div>
                
                {/* Volume control */}
                <div className="flex items-center gap-3">
                  <div className="w-24 flex-shrink-0">
                    <span className="text-slate-600 text-sm">Volume: {(voiceSettings.volume * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex-1">
                    <Slider 
                      value={[voiceSettings.volume]} 
                      min={0.1} 
                      max={1} 
                      step={0.1}
                      onValueChange={(values) => updateVoiceSetting('volume', values[0])}
                    />
                  </div>
                </div>
                
                {/* Available voices if not offline */}
                {!isOffline && voices.length > 0 && (
                  <div className="pt-2">
                    <label className="text-slate-600 text-sm block mb-1">Specific Voice:</label>
                    <select 
                      value={voiceSettings.preferredVoice}
                      onChange={(e) => updateVoiceSetting('preferredVoice', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-700"
                    >
                      <option value="">Auto-select based on gender</option>
                      {voices
                        .filter(voice => voice.lang.startsWith(language) || voice.lang.startsWith(language.split('-')[0]))
                        .map(voice => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                )}
                
                {/* Response preferences */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <span className="material-icons text-blue-600 mr-1 text-sm">smart_toy</span>
                    Response Preferences
                  </h4>
                  
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-blue-700 text-sm flex items-center gap-1">
                      <span className="material-icons text-blue-600 text-sm">reply_all</span>
                      Auto-respond when saving phrases
                    </label>
                    <div className="flex-shrink-0">
                      <Switch 
                        checked={voiceSettings.autoRespond}
                        onCheckedChange={(checked: boolean) => updateVoiceSetting('autoRespond', checked)}
                      />
                    </div>
                  </div>
                  
                  {voiceSettings.autoRespond && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-24 flex-shrink-0">
                        <span className="text-blue-700 text-sm">Delay: {voiceSettings.responseDelay}s</span>
                      </div>
                      <div className="flex-1">
                        <Slider 
                          value={[voiceSettings.responseDelay]} 
                          min={0} 
                          max={3} 
                          step={0.5}
                          onValueChange={(values) => updateVoiceSetting('responseDelay', values[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">bookmarks</span>
            <h3 className="font-medium text-slate-700">Saved Phrases</h3>
          </div>
          <span className="bg-slate-100 text-xs font-medium px-2 py-1 rounded-full text-slate-500">
            {savedPhrases.length} phrases
          </span>
        </div>
        
        <div className="p-2 max-h-60 overflow-y-auto">
          {savedPhrases.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {savedPhrases.map((phrase) => (
                <div key={phrase.id} className="p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                  <div className="flex items-center">
                    <p className="flex-1 text-slate-700 line-clamp-1 text-sm">{phrase.text}</p>
                    <div className="flex">
                      <button 
                        onClick={() => handleSpeakSavedPhrase(phrase.text)}
                        className="p-2 text-slate-400 hover:text-primary rounded-full"
                        title="Speak phrase"
                      >
                        <span className="material-icons text-sm">volume_up</span>
                      </button>
                      <button 
                        onClick={() => handleDeletePhrase(phrase.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete phrase"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 text-slate-400 flex flex-col items-center">
              <span className="material-icons text-slate-300 text-3xl mb-2">bookmark_border</span>
              <p>No saved phrases yet</p>
              <p className="text-xs mt-1">Save phrases for quick access</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
