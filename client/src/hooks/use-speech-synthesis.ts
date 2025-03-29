import { useState, useEffect, useCallback } from 'react';

interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export function useSpeechSynthesis(language: string = 'en-US') {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  
  // Check if speech synthesis is supported and get available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      // Function to update voices
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };
      
      // Get initial voices
      updateVoices();
      
      // Set up event listener for when voices change
      window.speechSynthesis.onvoiceschanged = updateVoices;
      
      // Clean up
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);
  
  // Speak function
  const speak = useCallback(
    (text: string, options: SpeechOptions = {}) => {
      if (!supported) return;
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = language;
      
      // Apply options
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
      
      // Set voice if provided
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        // Try to find a voice matching the language
        const languageVoices = voices.filter(
          voice => voice.lang.startsWith(language) || 
                  voice.lang.startsWith(language.split('-')[0])
        );
        
        if (languageVoices.length > 0) {
          utterance.voice = languageVoices[0];
        }
      }
      
      // Set event handlers
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Speak
      window.speechSynthesis.speak(utterance);
    },
    [supported, voices, language]
  );
  
  // Cancel speaking
  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);
  
  return {
    speak,
    cancel,
    speaking,
    supported,
    voices
  };
}
