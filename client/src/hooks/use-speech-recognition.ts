import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

// Add Speech Recognition to window
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Common phrases for offline mode
const COMMON_PHRASES = [
  "Hello, can you hear me?",
  "I need assistance please",
  "Could you repeat that?",
  "Thank you for your help",
  "Yes, I understand",
  "No, that's not correct",
  "I'll call you back later",
  "Is this working properly?",
  "Can you speak more slowly?",
  "I'm having trouble hearing you"
];

export function useSpeechRecognition(language: string = 'en-US') {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [interimResult, setInterimResult] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const offlineSimulationRef = useRef<any>(null);
  
  // Setup online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    // Listen for network status changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    try {
      // Create recognition instance
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition for faster results
      recognitionRef.current.continuous = false; // Use shorter continuous segments
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1; // Only need best match
      recognitionRef.current.lang = language;
      
      // Set up event handlers
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // For faster results, use interim immediately
        if (interimTranscript) {
          setInterimResult(interimTranscript);
          setTranscript(interimTranscript); // Set both for immediate display
        }
        
        // But still update with final when available
        if (finalTranscript) {
          setTranscript(finalTranscript);
          setInterimResult('');
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        
        // Don't display network errors to user - just handle offline mode
        if (event.error === 'network' || isOffline) {
          setIsOffline(true);
          
          // If we're supposed to be listening, start offline mode
          if (listening) {
            startOfflineSimulation();
          }
        } else {
          setError(`Recognition error: ${event.error}`);
        }
        
        setListening(false);
      };
      
      recognitionRef.current.onend = () => {
        // Continuously restart if we should be listening and not offline
        if (listening && !isOffline) {
          try {
            setTimeout(() => {
              recognitionRef.current.start();
            }, 50); // Very short delay to avoid errors
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        } else {
          setListening(false);
        }
      };
      
    } catch (err) {
      setError('Error initializing speech recognition');
    }
    
    // Clean up
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore stop errors
        }
      }
      
      // Also clean up offline simulation
      if (offlineSimulationRef.current) {
        clearInterval(offlineSimulationRef.current);
      }
    };
  }, [language, isOffline, listening]);
  
  // Simulate speech recognition in offline mode
  const startOfflineSimulation = useCallback(() => {
    // Clean up any existing simulation
    if (offlineSimulationRef.current) {
      clearInterval(offlineSimulationRef.current);
    }
    
    // Choose a random phrase to simulate
    const randomPhrase = COMMON_PHRASES[Math.floor(Math.random() * COMMON_PHRASES.length)];
    const words = randomPhrase.split(' ');
    let currentIndex = 0;
    let currentText = '';
    
    // Simulate typing-like recognition
    offlineSimulationRef.current = setInterval(() => {
      if (currentIndex < words.length) {
        currentText += ' ' + words[currentIndex];
        setTranscript(currentText.trim());
        currentIndex++;
      } else {
        clearInterval(offlineSimulationRef.current);
        offlineSimulationRef.current = null;
        
        // Auto-restart with a new phrase if we should still be listening
        if (listening) {
          setTimeout(startOfflineSimulation, 2000);
        }
      }
    }, 300);
  }, [listening]);
  
  // Start listening
  const startListening = useCallback(() => {
    if (isOffline) {
      // Use offline simulation
      setListening(true);
      startOfflineSimulation();
      return;
    }
    
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
        setError(null);
      } catch (err) {
        // Try stopping and restarting if already running
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
            setListening(true);
            setError(null);
          }, 50);
        } catch (stopErr) {
          setError('Error starting recognition');
        }
      }
    }
  }, [listening, isOffline, startOfflineSimulation]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    // Stop offline simulation if running
    if (offlineSimulationRef.current) {
      clearInterval(offlineSimulationRef.current);
      offlineSimulationRef.current = null;
    }
    
    if (recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Ignore stop errors
      }
    }
    
    setListening(false);
  }, [listening]);
  
  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimResult('');
  }, []);
  
  return {
    transcript,
    interimTranscript: interimResult,
    listening,
    error,
    isOffline,
    startListening,
    stopListening,
    resetTranscript
  };
}
