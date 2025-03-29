import { useState, useEffect, useCallback } from 'react';

export function useWebcam() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Function to start the camera
  const startCamera = useCallback(async () => {
    try {
      // Reset error state
      setError(null);
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      // Store the stream
      setStream(mediaStream);
      return mediaStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error accessing camera';
      setError(errorMessage);
      throw err;
    }
  }, []);
  
  // Function to stop the camera
  const stopCamera = useCallback(() => {
    if (stream) {
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);
  
  return {
    stream,
    error,
    startCamera,
    stopCamera
  };
}
