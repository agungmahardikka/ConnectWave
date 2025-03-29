import { useState, useRef, useEffect } from 'react';
import { useWebcam } from '@/hooks/use-webcam';
import { detectSignLanguage } from '@/lib/sign-detection';

export function SignLanguageMode() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
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
          }
        }
      }, 500);
    }

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [isCameraActive, stream]);

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

  return (
    <div className="flex-1 flex flex-col p-5">
      <div className="bg-white rounded-lg shadow-md p-5 mb-4">
        <h2 className="text-xl font-bold text-neutral-600 mb-2">Sign Language Translation</h2>
        <p className="text-neutral-400 mb-4">Use your camera to translate sign language gestures into text.</p>
        
        {/* Camera placeholder (shown when camera is off) */}
        {!isCameraActive && (
          <div className="bg-neutral-800 rounded-lg aspect-video flex flex-col items-center justify-center mb-4">
            <span className="material-icons text-white text-4xl mb-2">videocam_off</span>
            <p className="text-white text-sm">Camera is currently off</p>
          </div>
        )}
        
        {/* Active camera feed */}
        {isCameraActive && (
          <div className="bg-neutral-800 rounded-lg aspect-video mb-4 relative">
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover rounded-lg"
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full" 
              style={{ display: 'none' }}
            />
            
            {/* Camera controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded text-white hover:bg-opacity-30">
                <span className="material-icons">flash_on</span>
              </button>
              <button className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded text-white hover:bg-opacity-30">
                <span className="material-icons">flip_camera_android</span>
              </button>
            </div>
            
            {/* Recognition indicator */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-success animate-pulse"></div>
                <span className="text-white text-sm">Recognizing signs...</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mb-4">
          <button 
            onClick={handleToggleCamera}
            className="bg-primary hover:bg-primary-dark text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center"
          >
            <span className="material-icons mr-2">
              {isCameraActive ? 'videocam_off' : 'videocam'}
            </span>
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </button>
        </div>
        
        <div className="bg-neutral-100 rounded-lg p-4">
          <h3 className="font-medium text-neutral-600 mb-2">Recognized Text:</h3>
          <p className="min-h-10 text-lg font-medium">
            {recognizedText}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-medium text-neutral-600 mb-2">Sign Language Resources</h3>
        <div className="space-y-3">
          <a href="#" className="block p-3 bg-neutral-100 rounded hover:bg-neutral-200 flex items-center">
            <span className="material-icons mr-2 text-primary">school</span>
            <span>Learn basic Indian Sign Language (ISL)</span>
          </a>
          <a href="#" className="block p-3 bg-neutral-100 rounded hover:bg-neutral-200 flex items-center">
            <span className="material-icons mr-2 text-primary">menu_book</span>
            <span>ISL Dictionary</span>
          </a>
          <a href="#" className="block p-3 bg-neutral-100 rounded hover:bg-neutral-200 flex items-center">
            <span className="material-icons mr-2 text-primary">play_circle</span>
            <span>Practice with video tutorials</span>
          </a>
        </div>
      </div>
    </div>
  );
}
