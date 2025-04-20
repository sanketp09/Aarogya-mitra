import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { MODEL_PATHS, FALLBACK_CDNS } from '/public/models/index.js';

// Define model URLs with local paths as primary source
const MODEL_URLS = {
  // Local paths - primary 
  TINY_FACE_DETECTOR: MODEL_PATHS.TINY_FACE_DETECTOR,
  FACE_EXPRESSION: MODEL_PATHS.FACE_EXPRESSION,
  // CDN fallbacks in case local files are inaccessible
  TINY_FACE_DETECTOR_FALLBACK: FALLBACK_CDNS.TINY_FACE_DETECTOR,
  FACE_EXPRESSION_FALLBACK: FALLBACK_CDNS.FACE_EXPRESSION
};

interface EmotionDetectorProps {
  width: number;
  height: number;
  onEmotionCapture: (emotions: { [key: string]: number }) => void;
  isActive: boolean;
  onError?: (error: string) => void;
}

// Hard-coded default emotion values to use in case of detection failure
const DEFAULT_EMOTIONS = {
  neutral: 1,
  happy: 0,
  sad: 0,
  angry: 0,
  fearful: 0,
  disgusted: 0,
  surprised: 0
};

const EmotionDetector: React.FC<EmotionDetectorProps> = ({
  width = 480,
  height = 360,
  onEmotionCapture,
  isActive = true,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('Loading models...');
  const [faceDetected, setFaceDetected] = useState(false);
  const [emotionText, setEmotionText] = useState("");
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Handle error and provide fallback
  const handleModelError = useCallback(() => {
    console.log("Using fallback emotion values");
    setDetectionError("Failed to load face detection models. Please check your internet connection and try again.");
    
    // Provide default emotion data
    onEmotionCapture(DEFAULT_EMOTIONS);
    
    // Notify parent component
    if (onError) {
      onError("Failed to load face detection models");
    }
  }, [onEmotionCapture, onError]);
  
  // Pre-load models as early as possible
  useEffect(() => {
    // Preload models when component mounts, regardless of isActive
    const preloadModels = async () => {
      try {
        setLoadingProgress(10);
        setLoadingStatus("Initializing face detection...");
        
        // Ensure we didn't already load models
        if (faceapi.nets.tinyFaceDetector.isLoaded && 
            faceapi.nets.faceExpressionNet.isLoaded) {
          setIsModelLoaded(true);
          setLoadingProgress(100);
          return;
        }
        
        setLoadingProgress(30);
        setLoadingStatus("Loading local detection models...");
        
        try {
          // Try loading from local models first
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URLS.TINY_FACE_DETECTOR),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URLS.FACE_EXPRESSION)
          ]);
          console.log("Models loaded from local files");
          setLoadingProgress(100);
          setIsModelLoaded(true);
        } catch (localError) {
          console.error("Local models failed:", localError);
          setLoadingProgress(60);
          setLoadingStatus("Trying remote sources...");
          
          try {
            // Try fallback CDN
            await Promise.all([
              faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URLS.TINY_FACE_DETECTOR_FALLBACK),
              faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URLS.FACE_EXPRESSION_FALLBACK)
            ]);
            console.log("Models loaded from fallback CDN");
            setLoadingProgress(100);
            setIsModelLoaded(true);
          } catch (fallbackError) {
            console.error("All model loading attempts failed:", fallbackError);
            setLoadingProgress(0);
            handleModelError();
          }
        }
      } catch (error) {
        console.error("Model loading error:", error);
        handleModelError();
      }
    };

    preloadModels();
    
    return () => {
      // Cleanup if needed
    };
  }, [handleModelError]);
  
  // Setup camera only when models are loaded and component is active
  useEffect(() => {
    if (!isActive || detectionError || !isModelLoaded || !videoRef.current) return;
    
    let isMounted = true;
    
    const setupCamera = async () => {
      try {
        // Stop any existing stream
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
        
        setLoadingStatus("Accessing camera...");
        
        // Get new camera stream with optimized constraints for visibility
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 }
          }
        });
        
        if (videoRef.current && isMounted) {
          videoRef.current.srcObject = stream;
          
          try {
            await videoRef.current.play();
            setLoadingStatus("");
          } catch (playError) {
            console.error('Error playing video:', playError);
            if (onError) onError('Could not play video stream');
          }
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        if (isMounted && onError) onError('Could not access webcam');
        if (isMounted) setDetectionError('Could not access your camera. Please check permissions and try again.');
      }
    };
    
    setupCamera();
    
    return () => {
      isMounted = false;
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isActive, isModelLoaded, detectionError, width, height, onError]);
  
  // Run detection only when models are loaded and no errors
  useEffect(() => {
    if (!isActive || detectionError || !isModelLoaded || !videoRef.current) return;
    
    let isMounted = true;
    let rafId: number | null = null;
    let lastDetectionTime = 0;
    
    const runDetection = async () => {
      if (!isMounted || !videoRef.current || 
          videoRef.current.paused || 
          videoRef.current.ended || 
          !videoRef.current.readyState) {
        rafId = requestAnimationFrame(runDetection);
        return;
      }
      
      const now = Date.now();
      if (now - lastDetectionTime < 200) { // Reduced frequency for better stability
        rafId = requestAnimationFrame(runDetection);
        return;
      }
      
      lastDetectionTime = now;
      
      try {
        const options = new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 160, 
          scoreThreshold: 0.3 
        });
        
        // Check if video is ready
        if (videoRef.current.readyState !== 4) {
          rafId = requestAnimationFrame(runDetection);
          return;
        }
        
        const result = await faceapi
          .detectSingleFace(videoRef.current, options)
          .withFaceExpressions();
        
        if (result && isMounted) {
          setFaceDetected(true);
          
          // Extract emotions and find dominant one
          const emotions = result.expressions;
          const dominant = Object.entries(emotions)
            .sort((a, b) => b[1] - a[1])[0];
          
          setEmotionText(`${dominant[0]}: ${Math.round(dominant[1] * 100)}%`);
          
          // Send to parent
          onEmotionCapture(emotions);
        } else if (isMounted) {
          setFaceDetected(false);
        }
      } catch (error) {
        console.error('Detection error:', error);
        // Don't fail completely on detection errors, just continue trying
      }
      
      if (isMounted) {
        rafId = requestAnimationFrame(runDetection);
      }
    };
    
    // Start detection loop
    runDetection();
    
    return () => {
      isMounted = false;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive, isModelLoaded, detectionError, onEmotionCapture]);
  
  return (
    <div className="relative bg-black rounded-lg overflow-hidden h-full w-full flex items-center justify-center" ref={containerRef}>
      {/* Error state */}
      {detectionError && (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-30 flex flex-col items-center justify-center p-4 text-white">
          <p className="mb-4 text-red-400">{detectionError}</p>
          <div className="flex flex-col gap-2">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            
            {/* Continue without facial analysis */}
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-2"
              onClick={() => {
                // Hide error but don't reset detection error state
                // This allows the component to continue in "fallback mode"
                if (onError) onError('User continued without facial analysis');
                
                // Use default emotion data
                onEmotionCapture(DEFAULT_EMOTIONS);
                
                // Notify parent to hide error UI
                setDetectionError(null);
              }}
            >
              Continue Without Facial Analysis
            </button>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {!isModelLoaded && !detectionError && (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-30 flex items-center justify-center">
          <div className="text-center text-white w-[80%]">
            <div className="flex items-center justify-center mb-2">
              <div className="inline-block w-10 h-10 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            </div>
            <p className="mb-2">{loadingStatus}</p>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
              <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <p className="text-xs text-gray-400">This may take a few moments depending on your connection speed</p>
          </div>
        </div>
      )}
      
      {/* Video element - shown when detection is working */}
      {(isModelLoaded && !detectionError) && (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover" 
        />
      )}
      
      {/* Fallback display when using default emotions */}
      {(!isModelLoaded && detectionError === null) && (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <Smile className="h-16 w-16 mx-auto text-gray-400 mb-2" />
            <p className="text-white text-sm">Continuing without facial analysis</p>
          </div>
        </div>
      )}
      
      {/* Detection overlay shown only when detection is active */}
      {isModelLoaded && !detectionError && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Face detection status indicator */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs text-white flex items-center bg-black bg-opacity-50">
            <div 
              className={`w-3 h-3 rounded-full mr-2 ${faceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            ></div>
            {faceDetected ? 'Face detected' : 'No face detected'}
          </div>
          
          {/* Emotion text with emoji */}
          {faceDetected && emotionText && (
            <div className="absolute top-2 right-2 px-3 py-2 bg-black bg-opacity-50 rounded-lg text-sm text-white flex items-center">
              {emotionText.includes('happy') && <span className="mr-1">😊</span>}
              {emotionText.includes('sad') && <span className="mr-1">😢</span>}
              {emotionText.includes('angry') && <span className="mr-1">😠</span>}
              {emotionText.includes('fearful') && <span className="mr-1">😨</span>}
              {emotionText.includes('disgusted') && <span className="mr-1">🤢</span>}
              {emotionText.includes('surprised') && <span className="mr-1">😲</span>}
              {emotionText.includes('neutral') && <span className="mr-1">😐</span>}
              {emotionText}
            </div>
          )}
          
          {/* Helper text */}
          {!faceDetected && (
            <div className="absolute bottom-4 inset-x-0 text-center">
              <span className="px-3 py-2 bg-black bg-opacity-50 rounded-lg text-sm text-white">
                <span className="mr-2">🔍</span>
                Try moving closer to the camera or improve lighting
              </span>
            </div>
          )}
          
          {/* Visual frame for active detection */}
          {faceDetected && (
            <div className="absolute inset-0 border-2 border-green-500 opacity-40 rounded animate-pulse"></div>
          )}
        </div>
      )}
    </div>
  );
};

// Import the smile icon
function Smile(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
}

export default EmotionDetector; 