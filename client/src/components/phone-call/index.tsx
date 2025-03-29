import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TooltipTrigger } from '@/components/ui/tooltip';

type Message = {
  id: string;
  text: string;
  sender: 'caller' | 'user';
  method?: 'text' | 'voice'; // How the user sent their message
};

export function PhoneCallMode({ language }: { language: string }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [responseInput, setResponseInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [useVoiceResponse, setUseVoiceResponse] = useState(false);
  const [accessibility, setAccessibility] = useState<'deaf' | 'mute' | 'both'>('both');
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState<NodeJS.Timeout | null>(null);
  
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    startListening, 
    stopListening, 
    transcript, 
    listening, 
    resetTranscript 
  } = useSpeechRecognition(language);
  
  const { speak, speaking, cancel } = useSpeechSynthesis(language);

  // Recording related state
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([]);
  const [activeCallId, setActiveCallId] = useState<number | null>(null);
  
  // Quick response phrases with categories
  const quickResponses = {
    general: [
      'Hello, how can I help you?',
      'Yes, I understand',
      'Thank you for your patience',
      'Could you please repeat that?'
    ],
    accessibility: [
      'I am deaf, please speak clearly',
      'I use text-to-speech technology',
      'Please wait while I type my response',
      'I can read what you say, but respond with text'
    ]
  };

  // Start call timer when call becomes active
  useEffect(() => {
    if (isCallActive && !callTimer) {
      const timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      setCallTimer(timer);
    } else if (!isCallActive && callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
      setCallDuration(0);
    }
    
    return () => {
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, [isCallActive, callTimer]);

  // Handle transcript changes (caller's speech to text)
  useEffect(() => {
    // Check if we have a transcript and if the call is active
    if (transcript && transcript.trim() !== '' && isCallActive) {
      console.log("Received transcript:", transcript, "Listening:", listening);
      
      // Create a new message from the caller
      const newMessage: Message = {
        id: Date.now().toString(),
        text: transcript,
        sender: 'caller',
      };
      
      // Add it to our messages list
      setMessages(prev => [...prev, newMessage]);
      
      // Reset the transcript to prepare for new speech
      resetTranscript();
    }
  }, [transcript, isCallActive, resetTranscript]);
  
  // Ensure we keep listening during an active call
  useEffect(() => {
    if (isCallActive && !listening && !useVoiceResponse) {
      // If call is active but we're not listening, start listening
      console.log("Starting speech recognition for caller...");
      startListening();
    }
  }, [isCallActive, listening, useVoiceResponse, startListening]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize recording functionality
  useEffect(() => {
    // Set up recording when call is active
    if (isCallActive && !audioRecorder) {
      // Request microphone access
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const recorder = new MediaRecorder(stream);
          
          // Store audio chunks when data is available
          recorder.ondataavailable = (e) => {
            setRecordedChunks(chunks => [...chunks, e.data]);
          };
          
          setAudioRecorder(recorder);
        })
        .catch(err => {
          console.error("Error accessing microphone for call recording:", err);
        });
    }
    
    // Cleanup when call ends
    return () => {
      if (audioRecorder && audioRecorder.state === 'recording') {
        audioRecorder.stop();
      }
    };
  }, [isCallActive, audioRecorder]);
  
  // Save recorded audio when call ends
  useEffect(() => {
    if (!isCallActive && recordedChunks.length > 0 && activeCallId) {
      // Create audio blob from chunks
      const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
      
      // Create a form data object to send the blob
      const formData = new FormData();
      formData.append('audio', audioBlob, 'call-recording.webm');
      
      // Upload the recording
      fetch('/api/recordings', {
        method: 'POST',
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          // Update the call log with the recording path
          fetch(`/api/call-logs/${activeCallId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              hasRecording: true,
              recordingPath: data.path,
              endTime: new Date().toISOString(),
              duration: callDuration
            })
          });
          
          // Reset recording state
          setRecordedChunks([]);
          setAudioRecorder(null);
          setActiveCallId(null);
        })
        .catch(error => {
          console.error('Error saving call recording:', error);
        });
    }
  }, [isCallActive, recordedChunks, activeCallId, callDuration]);
  
  // Save messages to call log
  useEffect(() => {
    if (isCallActive && activeCallId && messages.length > 1) {
      // Get the most recent message
      const lastMessage = messages[messages.length - 1];
      
      // Save message to call log
      fetch(`/api/call-logs/${activeCallId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: lastMessage.text,
          sender: lastMessage.sender,
          method: lastMessage.method || null
        })
      })
        .catch(error => {
          console.error('Error saving call message:', error);
        });
    }
  }, [isCallActive, activeCallId, messages]);
  
  const handleStartCall = async (type: 'deaf' | 'mute' | 'both') => {
    try {
      setIsCallActive(true);
      setAccessibility(type);
      setMessages([]);
      startListening(); // Start converting caller's speech to text
      
      // Add initial greeting from system
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: "Call connected. The other person's speech will appear as text here.",
        sender: 'caller',
      };
      
      setMessages([initialMessage]);
      
      try {
        // Create call log in the database
        const response = await fetch('/api/call-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: 1, // Using a default user ID for now
            mode: type,
            language: language
          })
        });
        
        if (response.ok) {
          const callLog = await response.json();
          // Store the call ID for recording and messages
          setActiveCallId(callLog.id);
        } else {
          console.error('Failed to create call log:', response.statusText);
        }
      } catch (error) {
        console.error('Error creating call log:', error);
      }
      
      // Start recording if recorder is available
      if (audioRecorder) {
        setIsRecording(true);
        audioRecorder.start();
      }
    } catch (error) {
      console.error('Error starting call:', error);
    }
  };

  const handleEndCall = async () => {
    try {
      // Stop speech recognition and synthesis
      stopListening();
      if (speaking) {
        cancel();
      }
      
      // Stop recording if active
      if (isRecording && audioRecorder && audioRecorder.state === 'recording') {
        audioRecorder.stop();
        setIsRecording(false);
      }
      
      // Update call log with end time and duration (if we have an active call)
      if (activeCallId) {
        try {
          const response = await fetch(`/api/call-logs/${activeCallId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              endTime: new Date().toISOString(),
              duration: callDuration
            })
          });
          
          if (!response.ok) {
            console.error('Failed to update call log:', response.statusText);
          }
        } catch (error) {
          console.error('Error updating call log:', error);
        }
      }
      
      // Finally set call to inactive
      setIsCallActive(false);
    } catch (error) {
      console.error('Error ending call:', error);
      setIsCallActive(false); // Ensure call is marked as inactive even if there's an error
    }
  };

  const handleSendTextResponse = () => {
    if (!responseInput.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: responseInput,
      sender: 'user',
      method: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Convert text to speech for the caller to hear
    speak(responseInput);
    setResponseInput('');
  };

  const handleVoiceResponseToggle = () => {
    setUseVoiceResponse(prev => !prev);
    
    if (useVoiceResponse) {
      // Was using voice, now switching to text
      stopListening();
    } else {
      // Was using text, now switching to voice
      resetTranscript();
      startListening();
    }
  };

  const handleSendVoiceResponse = () => {
    if (!transcript || !transcript.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      sender: 'user',
      method: 'voice'
    };
    
    setMessages(prev => [...prev, newMessage]);
    resetTranscript();
  };

  const handleQuickResponse = (text: string) => {
    setResponseInput(text);
    // Focus the input field
    const inputEl = document.getElementById('response-input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  const formatCallDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      {!isCallActive ? (
        <PreCallInterface onStartCall={handleStartCall} onQuickResponse={handleQuickResponse} />
      ) : (
        <ActiveCallInterface 
          messages={messages}
          responseInput={responseInput}
          onResponseChange={setResponseInput}
          onSendTextResponse={handleSendTextResponse}
          onSendVoiceResponse={handleSendVoiceResponse}
          onEndCall={handleEndCall}
          onQuickResponse={handleQuickResponse}
          quickResponses={quickResponses}
          messageContainerRef={messageContainerRef}
          callDuration={formatCallDuration(callDuration)}
          useVoiceResponse={useVoiceResponse}
          onVoiceResponseToggle={handleVoiceResponseToggle}
          listening={listening}
          transcript={transcript}
          accessibility={accessibility}
          speaking={speaking}
        />
      )}
    </div>
  );
}

function PreCallInterface({ 
  onStartCall, 
  onQuickResponse 
}: { 
  onStartCall: (type: 'deaf' | 'mute' | 'both') => void;
  onQuickResponse: (text: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<'deaf' | 'mute' | 'both'>('both');
  
  const savedPhrases = [
    'Please speak slowly',
    'Can you repeat that?',
    'I\'ll be with you shortly',
    'Thank you for calling'
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-xl font-bold text-gradient">Phone Call Assistant</h2>
          <p className="text-slate-500 text-sm mt-1">Communicate on phone calls with real-time speech-to-text and text-to-speech conversion.</p>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div className="relative h-28 w-28 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6">
            <div className="absolute inset-2 bg-white rounded-full"></div>
            <span className="material-icons text-5xl text-primary relative z-10">phone_in_talk</span>
          </div>
          
          {/* Accessibility Mode Selection */}
          <div className="w-full bg-slate-50 rounded-xl p-1 flex mb-6 border border-slate-100">
            <button 
              onClick={() => setActiveTab('deaf')}
              className={`flex-1 py-2 px-3 rounded-lg flex flex-col items-center ${
                activeTab === 'deaf' 
                  ? 'bg-white shadow-sm border border-slate-200' 
                  : 'hover:bg-white/50'
              }`}
            >
              <span className="material-icons mb-1 text-primary">hearing_disabled</span>
              <span className={activeTab === 'deaf' ? 'text-slate-700 font-medium' : 'text-slate-500'}>For Deaf</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('mute')}
              className={`flex-1 py-2 px-3 rounded-lg flex flex-col items-center ${
                activeTab === 'mute' 
                  ? 'bg-white shadow-sm border border-slate-200' 
                  : 'hover:bg-white/50'
              }`}
            >
              <span className="material-icons mb-1 text-primary">mic_off</span>
              <span className={activeTab === 'mute' ? 'text-slate-700 font-medium' : 'text-slate-500'}>For Mute</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('both')}
              className={`flex-1 py-2 px-3 rounded-lg flex flex-col items-center ${
                activeTab === 'both' 
                  ? 'bg-white shadow-sm border border-slate-200' 
                  : 'hover:bg-white/50'
              }`}
            >
              <span className="material-icons mb-1 text-primary">accessibility_new</span>
              <span className={activeTab === 'both' ? 'text-slate-700 font-medium' : 'text-slate-500'}>Combined</span>
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="w-full mb-6">
            {activeTab === 'deaf' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center">
                  <span className="material-icons text-primary mr-2">hearing_disabled</span>
                  Deaf-Friendly Mode
                </h4>
                <p className="text-slate-500 text-sm mb-4">In this mode:</p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>The caller's speech will be converted to text for you to read</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>You can reply using text that will be spoken aloud to the caller</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>Quick responses available for common phrases</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'mute' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center">
                  <span className="material-icons text-primary mr-2">mic_off</span>
                  Mute-Friendly Mode
                </h4>
                <p className="text-slate-500 text-sm mb-4">In this mode:</p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>You can type messages that will be converted to speech for the caller</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>The caller's responses will be heard normally</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>Your text and their audio will be displayed in the conversation</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'both' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-medium text-slate-700 mb-2 flex items-center">
                  <span className="material-icons text-primary mr-2">accessibility_new</span>
                  Combined Accessibility Mode
                </h4>
                <p className="text-slate-500 text-sm mb-4">In this mode:</p>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>All speech is converted to text for reading</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>All text inputs are converted to speech for hearing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-green-500 mr-2 text-sm">check_circle</span>
                    <span>Switch between voice and text input as needed</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="w-full space-y-3">
            <button 
              onClick={() => onStartCall(activeTab)}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary-dark hover:to-primary text-white py-3 px-6 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow"
            >
              <span className="material-icons mr-2">call</span>
              Make a Call
            </button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-slate-400 text-sm">or</span>
              </div>
            </div>
            
            <button 
              onClick={() => onStartCall(activeTab)}
              className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 px-6 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200"
            >
              <span className="material-icons mr-2">call_received</span>
              Simulate Incoming Call
            </button>
          </div>
        </div>
      </div>
      
      {/* Saved Phrases Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4 flex items-center">
          <span className="material-icons text-primary mr-2">bookmarks</span>
          <h3 className="font-medium text-slate-700">Saved Phrases</h3>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedPhrases.map((phrase, index) => (
              <button 
                key={index}
                onClick={() => onQuickResponse(phrase)}
                className="text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 text-sm text-slate-700"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveCallInterface({ 
  messages,
  responseInput,
  onResponseChange,
  onSendTextResponse,
  onSendVoiceResponse,
  onEndCall,
  onQuickResponse,
  quickResponses,
  messageContainerRef,
  callDuration,
  useVoiceResponse,
  onVoiceResponseToggle,
  listening,
  transcript,
  accessibility,
  speaking
}: { 
  messages: Message[];
  responseInput: string;
  onResponseChange: (text: string) => void;
  onSendTextResponse: () => void;
  onSendVoiceResponse: () => void;
  onEndCall: () => void;
  onQuickResponse: (text: string) => void;
  quickResponses: {
    general: string[];
    accessibility: string[];
  };
  messageContainerRef: React.RefObject<HTMLDivElement>;
  callDuration: string;
  useVoiceResponse: boolean;
  onVoiceResponseToggle: () => void;
  listening: boolean;
  transcript: string;
  accessibility: 'deaf' | 'mute' | 'both';
  speaking: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      {/* Call Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mr-3">
            <span className="material-icons text-white">person</span>
          </div>
          <div>
            <div className="font-medium text-white">Active Call</div>
            <div className="flex items-center text-slate-300 text-xs">
              <div className="flex items-center mr-3">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse mr-1"></span>
                <span>Connected</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-xs mr-1">schedule</span>
                <span>{callDuration}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="bg-white/10 backdrop-blur-sm h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <span className="material-icons text-sm">volume_up</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Adjust volume</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Badge variant="outline" className="bg-black/20 text-white border-white/20 px-2 py-0.5 text-xs">
            {accessibility === 'deaf' ? 'Deaf Mode' : accessibility === 'mute' ? 'Mute Mode' : 'Combined Mode'}
          </Badge>
          
          <button 
            onClick={onEndCall}
            className="bg-red-500 hover:bg-red-600 text-white h-8 w-8 rounded-full flex items-center justify-center"
          >
            <span className="material-icons text-sm">call_end</span>
          </button>
        </div>
      </div>
      
      {/* Messages Area */}
      <div 
        ref={messageContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50"
        style={{ maxHeight: '50vh' }}
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`mb-3 rounded-xl max-w-[85%] shadow-sm ${
              message.sender === 'caller' 
              ? 'bg-white border border-slate-200 ml-1' 
              : 'bg-primary/90 text-white mr-1 ml-auto'
            }`}
          >
            <div className="p-3">
              <div className={`flex items-center text-xs mb-1 ${
                message.sender === 'caller' ? 'text-slate-400' : 'text-white/80'
              }`}>
                {message.sender === 'caller' ? (
                  <>
                    <span className="material-icons text-xs mr-1">person</span>
                    <span className="font-medium">Caller</span>
                  </>
                ) : (
                  <>
                    <span className="material-icons text-xs mr-1">
                      {message.method === 'voice' ? 'record_voice_over' : 'chat'}
                    </span>
                    <span className="font-medium">
                      You {message.method === 'voice' ? '(Voice)' : '(Text)'}
                    </span>
                  </>
                )}
              </div>
              <p className={message.sender === 'caller' ? 'text-slate-700' : 'text-white'}>
                {message.text}
              </p>
            </div>
          </div>
        ))}
        
        {/* Live transcription indicator when the other person is speaking */}
        {listening && !useVoiceResponse && (
          <div className="flex items-center text-slate-400 text-sm ml-2">
            <div className="flex space-x-1 mr-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '500ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '1000ms' }}></div>
            </div>
            <span>Listening to caller...</span>
          </div>
        )}
        
        {/* Text-to-speech indicator when speaking to caller */}
        {speaking && (
          <div className="flex items-center justify-center text-slate-400 text-sm py-2">
            <div className="flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="material-icons text-primary text-sm animate-pulse mr-2">volume_up</span>
              <span>Speaking to caller...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Voice Response UI (shown when voice response mode is active) */}
      {useVoiceResponse && (
        <div className="p-4 bg-slate-100 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="material-icons text-primary mr-2">mic</span>
              <h3 className="font-medium text-slate-700">Voice Response Mode</h3>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={onVoiceResponseToggle}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded"
                  >
                    <span className="material-icons">keyboard</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to text input</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200 min-h-24 mb-3 relative">
            {listening ? (
              <>
                <p className="text-slate-700 mb-2">{transcript || "Speak your response..."}</p>
                <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '600ms' }}></div>
                    </div>
                    <span className="text-xs text-slate-400">Listening to your voice...</span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-400 italic">Click the microphone button to start speaking</p>
            )}
          </div>
          
          <div className="flex justify-center space-x-3">
            {!listening ? (
              <button 
                onClick={onVoiceResponseToggle}
                className="bg-primary hover:bg-primary-dark text-white py-3 px-5 rounded-full font-medium flex items-center justify-center"
              >
                <span className="material-icons mr-2">mic</span>
                Start Speaking
              </button>
            ) : (
              <>
                <button 
                  onClick={onVoiceResponseToggle}
                  className="bg-red-500 hover:bg-red-600 text-white py-3 px-5 rounded-full font-medium flex items-center justify-center"
                >
                  <span className="material-icons mr-2">mic_off</span>
                  Stop
                </button>
                
                <button 
                  onClick={onSendVoiceResponse}
                  disabled={!transcript}
                  className="bg-green-500 hover:bg-green-600 text-white py-3 px-5 rounded-full font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-icons mr-2">send</span>
                  Send
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Text Response UI (shown when text response mode is active) */}
      {!useVoiceResponse && (
        <div className="p-4 border-t border-slate-200">
          {/* Quick Responses */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600 flex items-center">
                <span className="material-icons text-primary text-sm mr-1">flash_on</span>
                Quick Responses
              </h3>
              <button 
                onClick={() => {
                  const tabsEl = document.getElementById('quick-response-tabs');
                  if (tabsEl) {
                    tabsEl.scrollLeft = tabsEl.scrollWidth;
                  }
                }}
                className="text-xs text-primary hover:text-primary-dark"
              >
                See all
              </button>
            </div>
            
            <div 
              id="quick-response-tabs"
              className="flex overflow-x-auto scrollbar-hide pb-2 space-x-2"
            >
              {/* General quick responses */}
              {quickResponses.general.map((response, index) => (
                <button 
                  key={`general-${index}`}
                  onClick={() => onQuickResponse(response)}
                  className="whitespace-nowrap bg-slate-50 p-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
                >
                  {response}
                </button>
              ))}
              
              {/* Accessibility-specific responses */}
              {quickResponses.accessibility.map((response, index) => (
                <button 
                  key={`access-${index}`}
                  onClick={() => onQuickResponse(response)}
                  className="whitespace-nowrap bg-primary/5 p-2 rounded-lg border border-primary/10 text-sm text-primary hover:bg-primary/10 transition-colors flex-shrink-0"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>
          
          {/* Text Input Area */}
          <div className="flex items-center">
            <div className="flex-1 relative">
              <input 
                id="response-input"
                type="text" 
                placeholder="Type your response..." 
                value={responseInput}
                onChange={(e) => onResponseChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSendTextResponse();
                  }
                }}
                className="w-full border border-slate-200 rounded-full py-3 px-4 pr-16 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-slate-700 placeholder:text-slate-400"
              />
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={onVoiceResponseToggle}
                      className="absolute right-16 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary p-1.5 rounded-full hover:bg-slate-100"
                    >
                      <span className="material-icons">mic</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch to voice input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={() => onResponseChange('')}
                      className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
                    >
                      <span className="material-icons">clear</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Clear input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <button 
              onClick={onSendTextResponse}
              disabled={!responseInput.trim()}
              className="ml-2 bg-primary hover:bg-primary-dark text-white h-12 w-12 rounded-full flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <span className="material-icons">send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
