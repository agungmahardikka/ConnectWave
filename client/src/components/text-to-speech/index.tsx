import { useState, useEffect } from 'react';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { Slider } from '@/components/ui/slider';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

type SavedPhrase = {
  id: number;
  text: string;
};

export function TextToSpeechMode({ language }: { language: string }) {
  const [text, setText] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [voiceType, setVoiceType] = useState('female');

  const { speak, voices } = useSpeechSynthesis(language);

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

  const handleSpeak = () => {
    if (text.trim()) {
      speak(text, {
        rate: speechRate,
        voice: getSelectedVoice()
      });
    }
  };

  const handleSavePhrase = () => {
    if (text.trim()) {
      saveMutation.mutate(text);
      // Clear the text after saving
      setText('');
    }
  };

  const handleDeletePhrase = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSpeakSavedPhrase = (phraseText: string) => {
    speak(phraseText, {
      rate: speechRate,
      voice: getSelectedVoice()
    });
  };

  const getSelectedVoice = () => {
    const voiceOptions = voices.filter(voice => 
      voice.lang.startsWith(language) || voice.lang.startsWith(language.split('-')[0])
    );
    
    if (voiceType === 'male') {
      return voiceOptions.find(voice => !voice.name.includes('Female')) || null;
    } else {
      return voiceOptions.find(voice => voice.name.includes('Female')) || null;
    }
  };

  return (
    <div className="flex-1 flex flex-col p-5">
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="text-xl font-bold text-neutral-600 mb-2">Text to Speech</h2>
        <p className="text-neutral-400 mb-4">Type text below and it will be spoken aloud. Save common phrases for quick access.</p>
        
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type what you want to say..." 
          className="w-full border border-neutral-300 rounded-lg p-4 min-h-32 mb-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={handleSpeak}
            className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium flex items-center justify-center"
          >
            <span className="material-icons mr-2">volume_up</span>
            Speak
          </button>
          <button 
            onClick={handleSavePhrase}
            disabled={text.trim() === ''}
            className="flex-1 bg-secondary hover:bg-secondary-dark text-neutral-600 py-3 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons mr-2">save</span>
            Save Phrase
          </button>
        </div>
        
        <div className="flex items-center mb-4">
          <span className="mr-2 text-neutral-500">Voice:</span>
          <select 
            value={voiceType}
            onChange={(e) => setVoiceType(e.target.value)}
            className="border border-neutral-300 rounded p-2 bg-white"
          >
            <option value="female">Female (Default)</option>
            <option value="male">Male</option>
          </select>
          
          <span className="ml-4 mr-2 text-neutral-500">Speed:</span>
          <div className="w-20">
            <Slider 
              value={[speechRate]} 
              min={0.5} 
              max={2} 
              step={0.1}
              onValueChange={(values) => setSpeechRate(values[0])}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-medium text-neutral-600 mb-2">Saved Phrases</h3>
        <div className="space-y-2">
          {savedPhrases.length > 0 ? (
            savedPhrases.map((phrase) => (
              <div key={phrase.id} className="flex items-center justify-between p-3 bg-neutral-100 rounded">
                <span className="flex-1">{phrase.text}</span>
                <div className="flex">
                  <button 
                    onClick={() => handleSpeakSavedPhrase(phrase.text)}
                    className="p-2 text-primary hover:bg-neutral-200 rounded-full"
                  >
                    <span className="material-icons">volume_up</span>
                  </button>
                  <button 
                    onClick={() => handleDeletePhrase(phrase.id)}
                    className="p-2 text-neutral-400 hover:bg-neutral-200 rounded-full"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-neutral-400">
              No saved phrases yet. Save some phrases to access them quickly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
