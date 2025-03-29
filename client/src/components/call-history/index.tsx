import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';

type CallLog = {
  id: number;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  mode: 'deaf' | 'mute' | 'both';
  hasRecording: boolean;
  recordingPath: string | null;
  language: string;
};

type CallMessage = {
  id: number;
  callId: number;
  text: string;
  sender: 'user' | 'caller';
  timestamp: string;
  method: 'text' | 'voice' | null;
};

export function CallHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null);
  
  // Fetch call logs
  const { data: callLogs = [], isLoading: isLoadingLogs } = useQuery<CallLog[]>({
    queryKey: ['/api/call-logs'],
  });
  
  // Fetch call details when a call is selected
  const { data: selectedCallMessages = [], isLoading: isLoadingMessages } = useQuery<CallMessage[]>({
    queryKey: ['/api/call-logs', selectedCallId, 'messages'],
    enabled: selectedCallId !== null,
  });
  
  // Get selected call log
  const selectedCall = selectedCallId ? callLogs.find(log => log.id === selectedCallId) : null;
  
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'N/A';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getModeLabel = (mode: string) => {
    switch(mode) {
      case 'deaf': return 'Deaf Mode';
      case 'mute': return 'Mute Mode';
      case 'both': return 'Combined Mode';
      default: return mode;
    }
  };
  
  const handleViewCall = (callId: number) => {
    setSelectedCallId(callId);
    setIsOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsOpen(false);
    // Clear selected call after dialog closes
    setTimeout(() => setSelectedCallId(null), 300);
  };
  
  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="material-icons text-primary mr-2">history</span>
            <h2 className="text-xl font-bold text-gradient">Call History</h2>
          </div>
          <span className="bg-slate-100 text-xs font-medium px-2 py-1 rounded-full text-slate-500">
            {callLogs.length} calls
          </span>
        </div>
        
        <div className="p-4">
          {isLoadingLogs ? (
            <div className="p-8 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="mt-2 text-slate-500">Loading call history...</p>
            </div>
          ) : callLogs.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-icons text-slate-300 text-5xl mb-2">call_end</span>
              <p className="text-slate-500 mb-1">No call history yet</p>
              <p className="text-slate-400 text-sm">Make a call to see it in your history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {callLogs.map(call => (
                <div 
                  key={call.id}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-colors"
                >
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                        <span className="material-icons text-primary text-sm">phone</span>
                      </span>
                      <div>
                        <h3 className="font-medium text-slate-700">
                          {new Date(call.startTime).toLocaleDateString()} Call
                        </h3>
                        <p className="text-xs text-slate-500">
                          {formatDate(new Date(call.startTime))}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-slate-200 text-slate-700 mb-1">
                        {getModeLabel(call.mode)}
                      </span>
                      {call.duration && (
                        <p className="text-xs text-slate-500">
                          Duration: {formatDuration(call.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {call.hasRecording && (
                        <button className="inline-flex items-center text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          <span className="material-icons text-xs mr-1">mic</span>
                          Recording
                        </button>
                      )}
                      <span className="inline-flex items-center text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        <span className="material-icons text-xs mr-1">language</span>
                        {call.language.toUpperCase()}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => handleViewCall(call.id)}
                      className="text-sm text-primary hover:text-primary-dark"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Call Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              {selectedCall && (
                <div className="flex justify-between text-sm mt-1">
                  <span>
                    {formatDate(new Date(selectedCall.startTime))}
                  </span>
                  <span className="font-medium">
                    Duration: {formatDuration(selectedCall.duration)}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-slate-200 text-slate-700">
                    {getModeLabel(selectedCall.mode)}
                  </span>
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-slate-200 text-slate-700">
                    Language: {selectedCall.language.toUpperCase()}
                  </span>
                </div>
                
                {selectedCall.hasRecording && (
                  <button className="inline-flex items-center text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                    <span className="material-icons text-xs mr-1">play_arrow</span>
                    Play Recording
                  </button>
                )}
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b">
                  <h3 className="font-medium text-slate-700">Conversation Transcript</h3>
                </div>
                
                <div className="p-4 max-h-80 overflow-y-auto space-y-3">
                  {isLoadingMessages ? (
                    <div className="text-center py-8">
                      <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-slate-500 text-sm">Loading messages...</p>
                    </div>
                  ) : selectedCallMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500">No messages found for this call</p>
                    </div>
                  ) : (
                    selectedCallMessages.map(message => (
                      <div 
                        key={message.id}
                        className={`p-3 rounded-lg max-w-[85%] ${
                          message.sender === 'caller' 
                            ? 'bg-white border border-slate-200 ml-1' 
                            : 'bg-primary/90 text-white mr-1 ml-auto'
                        }`}
                      >
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
                          <span className="ml-auto text-[10px]">
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className={message.sender === 'caller' ? 'text-slate-700' : 'text-white'}>
                          {message.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Close</Button>
            <Button 
              onClick={() => console.log('Download transcript')}
              className="inline-flex items-center"
            >
              <span className="material-icons text-sm mr-1">text_snippet</span>
              Download Transcript
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}