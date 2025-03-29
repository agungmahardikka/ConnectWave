import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { OfflineTutorial } from '@/components/ui/offline-tutorial';

type OfflineIndicatorProps = {
  isOffline: boolean;
  mode: 'stt' | 'tts' | 'call' | 'sign';
  className?: string;
};

export function OfflineIndicator({ isOffline, mode, className = '' }: OfflineIndicatorProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Check if we should show tutorial automatically
  useEffect(() => {
    if (isOffline) {
      // Check if user has seen this tutorial before
      const hasSeen = localStorage.getItem(`offline-tutorial-seen-${mode}`);
      if (!hasSeen) {
        // Show tutorial automatically if they haven't seen it
        setShowTutorial(true);
      }
    }
  }, [isOffline, mode]);

  if (!isOffline) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="bg-yellow-50 text-yellow-700 border-yellow-200 cursor-pointer flex items-center"
              onClick={() => setShowTutorial(true)}
            >
              <span className="material-icons text-sm mr-1">wifi_off</span>
              Offline Mode
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-xs max-w-[200px]">
              <p>Currently operating in offline mode with limited functionality.</p>
              <p className="mt-1 font-medium">Click for help and tips</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
      </div>
      
      {/* The tutorial will be controlled by state */}
      {showTutorial && (
        <OfflineTutorial 
          mode={mode} 
          trigger={
            <div className="opacity-0 w-0 h-0 overflow-hidden">
              <button data-offline-tutorial-trigger>Hidden trigger for offline tutorial</button>
            </div>
          } 
          open={showTutorial}
          onOpenChange={setShowTutorial}
        />
      )}
    </div>
  );
}

// Also provide a hook that can be used throughout the app
export function useOfflineStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}