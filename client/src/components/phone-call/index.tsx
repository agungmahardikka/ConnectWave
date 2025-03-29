import { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

type Message = {
  id: string;
  text: string;
  sender: 'caller' | 'user';
};

export function PhoneCallMode({ language }: { language: string }) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [responseInput, setResponseInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  const { startListening, stopListening, transcript, listening, resetTranscript } = useSpeechRecognition(language);
  const { speak } = useSpeechSynthesis(language);

  // Quick response phrases
  const quickResponses = [
    'Hello, how can I help?',
    'Yes, this is support',
    'Please give me a moment',
    'Can you repeat that?'
  ];

  // Handle transcript changes
  useEffect(() => {
    if (transcript && transcript.trim() !== '' && isCallActive && !listening) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: transcript,
        sender: 'caller',
      };
      setMessages(prev => [...prev, newMessage]);
      resetTranscript();
      
      // Start listening again after a short delay
      setTimeout(() => {
        if (isCallActive) {
          startListening();
        }
      }, 1000);
    }
  }, [transcript, isCallActive, listening, resetTranscript, startListening]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartCall = () => {
    setIsCallActive(true);
    setMessages([]);
    startListening();
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    stopListening();
  };

  const handleSendResponse = () => {
    if (!responseInput.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: responseInput,
      sender: 'user',
    };
    
    setMessages(prev => [...prev, newMessage]);
    speak(responseInput);
    setResponseInput('');
  };

  const handleQuickResponse = (text: string) => {
    setResponseInput(text);
  };

  return (
    <div className="flex-1 flex flex-col">
      {!isCallActive ? (
        <PreCallInterface onStartCall={handleStartCall} onQuickResponse={handleQuickResponse} />
      ) : (
        <ActiveCallInterface 
          messages={messages}
          responseInput={responseInput}
          onResponseChange={setResponseInput}
          onSendResponse={handleSendResponse}
          onEndCall={handleEndCall}
          onQuickResponse={handleQuickResponse}
          quickResponses={quickResponses}
          messageContainerRef={messageContainerRef}
        />
      )}
    </div>
  );
}

function PreCallInterface({ 
  onStartCall, 
  onQuickResponse 
}: { 
  onStartCall: () => void;
  onQuickResponse: (text: string) => void;
}) {
  const savedPhrases = [
    'Please speak slowly',
    'Can you repeat that?',
    'I\'ll be with you shortly',
    'Thank you for calling'
  ];

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="rounded-full bg-neutral-200 w-24 h-24 flex items-center justify-center mb-6">
          <span className="material-icons text-5xl text-neutral-400">smartphone</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-600 mb-2">Phone Call Mode</h2>
        <p className="text-center text-neutral-400 mb-8">Converts caller's speech to text so you can read it, and your typed responses to speech for the caller to hear.</p>
        
        <div className="w-full space-y-4">
          <button 
            onClick={onStartCall}
            className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
          >
            <span className="material-icons mr-2">call</span>
            Make a Call
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-neutral-400 text-sm">or</span>
            </div>
          </div>
          
          <button 
            onClick={onStartCall}
            className="w-full bg-neutral-200 hover:bg-neutral-300 text-neutral-600 py-3 px-4 rounded-lg font-medium flex items-center justify-center"
          >
            <span className="material-icons mr-2">call_received</span>
            Simulate Incoming Call
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-neutral-100 border-t border-neutral-200">
        <h3 className="font-medium text-neutral-600 mb-2">Saved Phrases</h3>
        <div className="grid grid-cols-2 gap-2">
          {savedPhrases.map((phrase, index) => (
            <button 
              key={index}
              onClick={() => onQuickResponse(phrase)}
              className="text-left bg-white p-2 rounded border border-neutral-200 text-sm hover:border-primary"
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActiveCallInterface({ 
  messages,
  responseInput,
  onResponseChange,
  onSendResponse,
  onEndCall,
  onQuickResponse,
  quickResponses,
  messageContainerRef
}: { 
  messages: Message[];
  responseInput: string;
  onResponseChange: (text: string) => void;
  onSendResponse: () => void;
  onEndCall: () => void;
  onQuickResponse: (text: string) => void;
  quickResponses: string[];
  messageContainerRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-neutral-100 p-3 flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center mr-3">
            <span className="text-white font-medium">JD</span>
          </div>
          <div>
            <div className="font-medium">Active Call</div>
            <div className="text-sm text-neutral-400 flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-success mr-1"></span>
              <span>Connected</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onEndCall}
          className="bg-error hover:bg-red-700 text-white h-10 w-10 rounded-full flex items-center justify-center"
        >
          <span className="material-icons">call_end</span>
        </button>
      </div>
      
      <div 
        ref={messageContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
        style={{ maxHeight: '50vh' }}
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`mb-3 p-3 rounded-lg max-w-[80%] shadow-sm ${
              message.sender === 'caller' 
              ? 'bg-neutral-100' 
              : 'bg-primary-light text-white ml-auto'
            }`}
          >
            <span className={`font-semibold text-xs block mb-1 ${
              message.sender === 'caller' ? 'text-neutral-400' : 'text-white'
            }`}>
              {message.sender === 'caller' ? 'Caller:' : 'You (Text-to-Speech):'}
            </span>
            <span>{message.text}</span>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-neutral-200">
        <div className="mb-3">
          <h3 className="font-medium text-neutral-600 mb-2">Quick Responses</h3>
          <div className="flex overflow-x-auto pb-2 space-x-2">
            {quickResponses.map((response, index) => (
              <button 
                key={index}
                onClick={() => onQuickResponse(response)}
                className="whitespace-nowrap bg-white p-2 rounded border border-neutral-200 text-sm hover:border-primary"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Type your response..." 
              value={responseInput}
              onChange={(e) => onResponseChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSendResponse();
                }
              }}
              className="w-full border border-neutral-300 rounded-lg p-3 pr-10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-primary">
              <span className="material-icons">mic</span>
            </button>
          </div>
          <button 
            onClick={onSendResponse}
            className="ml-2 bg-primary hover:bg-primary-dark text-white h-12 w-12 rounded-full flex items-center justify-center"
          >
            <span className="material-icons">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
