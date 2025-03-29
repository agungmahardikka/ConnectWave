import { useState, useRef, useEffect } from 'react';
import { useWebcam } from '@/hooks/use-webcam';
import { detectSignLanguage } from '@/lib/sign-detection';

export function SignLanguageMode() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recognitionHistory, setRecognitionHistory] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { startCamera, stopCamera, stream } = useWebcam();

  // Start sign language detection when camera is active
  useEffect(() => {
    let detectionInterval: number | null = null;

    if (isCameraActive && stream && videoRef.current && canvasRef.current) {
      // Start detection loop
      detectionInterval = window.setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const result = detectSignLanguage(videoRef.current, canvasRef.current);
          if (result) {
            setRecognizedText(result);
            // Add to history if it's a new phrase
            if (!recognitionHistory.includes(result)) {
              setRecognitionHistory(prev => [...prev.slice(-4), result]);
            }
          }
        }
      }, 500);
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isCameraActive, stream, recognitionHistory]);

  const handleToggleCamera = async () => {
    if (isCameraActive) {
      stopCamera();
      setIsCameraActive(false);
      setRecognizedText('');
    } else {
      try {
        await startCamera();
        setIsCameraActive(true);
      } catch (error) {
        console.error('Failed to start camera:', error);
      }
    }
  };

  // Connect video stream when available
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleClearHistory = () => {
    setRecognitionHistory([]);
    setRecognizedText('');
  };

  return (
    <div className="flex-1 flex flex-col p-5 space-y-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4">
          <h2 className="text-xl font-bold text-gradient">Sign Language Translation</h2>
          <p className="text-slate-500 text-sm mt-1">Use your camera to translate sign language gestures into text.</p>
        </div>
        
        <div className="p-4">
          {/* Camera view */}
          <div className="rounded-xl overflow-hidden shadow-sm mb-4 aspect-video bg-slate-900 relative">
            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-slate-800/50 p-5 rounded-full">
                  <span className="material-icons text-white text-5xl">videocam_off</span>
                </div>
                <p className="text-white text-sm mt-4 bg-black/40 px-3 py-1 rounded-full">Camera is currently off</p>
              </div>
            )}
            
            {isCameraActive && (
              <>
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                <canvas 
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full" 
                  style={{ display: 'none' }}
                />
                
                {/* Camera UI overlay */}
                <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
                  <div className="flex items-center bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse mr-2"></div>
                    <span className="text-white text-xs">Recognizing signs</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="bg-black/30 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                      <span className="material-icons text-sm">flash_on</span>
                    </button>
                    <button className="bg-black/30 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white hover:bg-black/40 transition-colors">
                      <span className="material-icons text-sm">flip_camera_android</span>
                    </button>
                  </div>
                </div>
                
                {/* Recognized text overlay */}
                {recognizedText && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg max-w-max mx-auto">
                      <p className="text-white font-medium">
                        {recognizedText}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Camera controls */}
          <div className="flex justify-center mb-4">
            <button 
              onClick={handleToggleCamera}
              className={`py-3 px-6 rounded-full font-medium flex items-center justify-center shadow-sm transition-all duration-200 ${
                isCameraActive 
                  ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white' 
                  : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary-dark hover:to-primary text-white'
              }`}
            >
              <span className="material-icons mr-2">
                {isCameraActive ? 'videocam_off' : 'videocam'}
              </span>
              {isCameraActive ? 'Stop Camera' : 'Start Camera'}
            </button>
          </div>
          
          {/* Recognition history */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="material-icons text-primary mr-2 text-sm">history</span>
                <h3 className="font-medium text-slate-700 text-sm">Recognition History</h3>
              </div>
              
              {recognitionHistory.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <span className="material-icons text-sm">clear_all</span>
                </button>
              )}
            </div>
            
            <div className="min-h-16">
              {recognitionHistory.length > 0 ? (
                <div className="space-y-2">
                  {recognitionHistory.map((text, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-2 rounded border border-slate-200 text-slate-700"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-slate-400 flex flex-col items-center">
                  <span className="material-icons text-slate-300 text-xl mb-1">gesture</span>
                  <p className="text-sm">Start the camera to begin recognition</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="border-b border-slate-100 p-4 flex items-center">
          <span className="material-icons text-primary mr-2">school</span>
          <h3 className="font-medium text-slate-700">Sign Language Resources</h3>
        </div>
        
        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="#" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 flex items-center">
              <span className="mr-3 bg-primary/10 text-primary p-2 rounded-lg">
                <span className="material-icons">school</span>
              </span>
              <div>
                <p className="font-medium text-slate-700">Learn ISL Basics</p>
                <p className="text-xs text-slate-500 mt-0.5">Introductory lessons</p>
              </div>
            </a>
            
            <a href="#" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 flex items-center">
              <span className="mr-3 bg-primary/10 text-primary p-2 rounded-lg">
                <span className="material-icons">menu_book</span>
              </span>
              <div>
                <p className="font-medium text-slate-700">ISL Dictionary</p>
                <p className="text-xs text-slate-500 mt-0.5">Common signs & phrases</p>
              </div>
            </a>
            
            <a href="#" className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100 flex items-center">
              <span className="mr-3 bg-primary/10 text-primary p-2 rounded-lg">
                <span className="material-icons">play_circle</span>
              </span>
              <div>
                <p className="font-medium text-slate-700">Video Tutorials</p>
                <p className="text-xs text-slate-500 mt-0.5">Practice with experts</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
