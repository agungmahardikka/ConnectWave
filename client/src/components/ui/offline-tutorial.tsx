import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type OfflineTutorialProps = {
  mode: 'stt' | 'tts' | 'call' | 'sign';
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function OfflineTutorial({ mode, trigger, open: controlledOpen, onOpenChange }: OfflineTutorialProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Determine if we're in controlled or uncontrolled mode
  const isControlled = controlledOpen !== undefined && onOpenChange !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  
  // Function to set open state based on whether we're controlled or not
  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  };

  // Function to close the dialog
  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2" data-offline-tutorial-trigger>
            <span className="material-icons text-sm">help_outline</span>
            <span>Offline Mode Help</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-icons text-primary">wifi_off</span>
            <span>Offline Mode Tutorial</span>
            <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
              Limited Functionality
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Learn how to use {getTitleForMode(mode)} when you have no internet connection
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="about" className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="features">Available Features</TabsTrigger>
            <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="font-medium text-slate-800 mb-2">What is Offline Mode?</h3>
              <p className="text-slate-600 text-sm">
                Offline mode activates automatically when no internet connection is detected. 
                It provides basic functionality using locally-stored capabilities.
              </p>
              
              <div className="flex items-center gap-2 mt-4 p-2 bg-blue-50 text-blue-700 rounded border border-blue-100">
                <span className="material-icons text-blue-500">info</span>
                <p className="text-xs">
                  While offline, some advanced features may be unavailable or use simplified alternatives.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-slate-800">How Offline Mode Works:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span className="text-slate-600">Pre-downloaded language patterns are used for basic recognition</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span className="text-slate-600">Common phrases and responses are available offline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-green-500 text-sm">check_circle</span>
                  <span className="text-slate-600">All data is stored locally until connection is restored</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-red-500 text-sm">cancel</span>
                  <span className="text-slate-600">Advanced speech recognition and cloud features are unavailable</span>
                </li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            {getFeaturesForMode(mode)}
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="font-medium text-slate-800 mb-2">Offline Best Practices</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-icons text-primary text-sm">lightbulb</span>
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium">Save frequently:</span> In offline mode, save your work manually when possible to prevent data loss.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-icons text-primary text-sm">lightbulb</span>
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium">Use simple phrases:</span> Keep your speech clear and use common words for better offline recognition.
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="material-icons text-primary text-sm">lightbulb</span>
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium">Pre-save common phrases:</span> When online, save phrases you use frequently for offline access.
                  </p>
                </li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                <span className="material-icons text-yellow-600 mr-1">tips_and_updates</span>
                Pro Tips
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="material-icons text-yellow-600 text-sm">star</span>
                  <span className="text-yellow-700">Enable "Auto-Save" in settings before going offline</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-yellow-600 text-sm">star</span>
                  <span className="text-yellow-700">Regularly check connection status with the indicator in the top right</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-icons text-yellow-600 text-sm">star</span>
                  <span className="text-yellow-700">When offline recognition struggles, type manually instead</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              // Save "don't show again" preference to localStorage 
              localStorage.setItem(`offline-tutorial-seen-${mode}`, 'true');
              handleClose();
            }}
            className="mr-auto"
          >
            Don't show again
          </Button>
          <Button onClick={handleClose}>
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions to get mode-specific content
function getTitleForMode(mode: 'stt' | 'tts' | 'call' | 'sign'): string {
  switch (mode) {
    case 'stt':
      return 'Speech-to-Text';
    case 'tts':
      return 'Text-to-Speech';
    case 'call':
      return 'Phone Call Assistance';
    case 'sign':
      return 'Sign Language Translation';
    default:
      return 'the application';
  }
}

function getFeaturesForMode(mode: 'stt' | 'tts' | 'call' | 'sign') {
  switch (mode) {
    case 'stt':
      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">Available Offline Features:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Basic word recognition for common phrases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Text editing and copying functionality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Saving transcripts to local text files</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-medium text-red-800 mb-2">Limited or Unavailable:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Advanced speech recognition accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Recognition of specialized terminology</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Cloud-based improvements and learning</span>
              </li>
            </ul>
          </div>
        </div>
      );
    
    case 'tts':
      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">Available Offline Features:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Basic text-to-speech with default voice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Saved phrases library</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Text editing and history</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-medium text-red-800 mb-2">Limited or Unavailable:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">High-quality voice selection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Advanced pronunciation and intonation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Neural voice models</span>
              </li>
            </ul>
          </div>
        </div>
      );
      
    case 'call':
      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">Available Offline Features:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Basic call functionality with text input/output</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Pre-saved quick responses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Local call recording</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-medium text-red-800 mb-2">Limited or Unavailable:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Advanced voice recognition during calls</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Cloud storage for call history</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">High-quality speech synthesis</span>
              </li>
            </ul>
          </div>
        </div>
      );
      
    case 'sign':
      return (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="font-medium text-slate-800 mb-2">Available Offline Features:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Basic gesture recognition for common signs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Local camera input processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-green-500 text-sm">check_circle</span>
                <span className="text-slate-600">Text display for recognized signs</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-medium text-red-800 mb-2">Limited or Unavailable:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Advanced sign language detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Regional sign language variants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-icons text-red-500 text-sm">cancel</span>
                <span className="text-red-700">Full video processing capabilities</span>
              </li>
            </ul>
          </div>
        </div>
      );
  
    default:
      return null;
  }
}