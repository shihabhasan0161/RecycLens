import React, { useState, useRef } from 'react';
import { CameraView } from '../components/CameraView';
import { ArrowLeft, Check, AlertCircle, PartyPopper } from 'lucide-react';

interface SubmitProofViewProps {
  onBack: () => void;
  onComplete: () => void;
}

export const SubmitProofView: React.FC<SubmitProofViewProps> = ({ onBack, onComplete }) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleCapture = () => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          setCapturedImage(canvas.toDataURL('image/jpeg'));
          setError(null);
        } else {
            setError("Failed to capture image context.");
        }
      } catch (e) {
          setError("Failed to capture image.");
      }
    } else {
        setError("Camera stream not ready.");
    }
  };

  const handleSubmit = () => {
    // Simulate submission
    setShowSuccess(true);
    setTimeout(() => {
      onComplete();
    }, 2000); // Wait 2 seconds to show the message
  };

  const handleCameraError = (err: Error) => {
      setError(err.message || "Could not access camera. Please check permissions.");
  };

  if (showSuccess) {
      return (
          <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <PartyPopper className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Awesome!</h2>
              <p className="text-xl text-green-400 font-semibold">+1 Point Earned</p>
              <p className="text-gray-400 mt-4">Thanks for recycling!</p>
          </div>
      );
  }

  return (
    <div className="relative h-screen bg-black">
      {error && (
          <div className="absolute top-20 left-4 right-4 z-50 bg-red-500/90 text-white p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-white/80 hover:text-white">✕</button>
          </div>
      )}

      {!capturedImage ? (
        <>
          <CameraView 
            onVideoReady={(video) => { videoRef.current = video; }} 
            onError={handleCameraError}
          />
          <div className="absolute top-0 left-0 w-full p-4 z-10">
            <button onClick={onBack} className="p-2 bg-black/50 rounded-full text-white backdrop-blur-md">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-8 flex justify-center z-10">
            <button
              onClick={handleCapture}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-black" />
            </button>
          </div>
        </>
      ) : (
        <div className="h-full flex flex-col bg-gray-900">
          <div className="relative flex-1 bg-black">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
            <button onClick={() => setCapturedImage(null)} className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 bg-gray-900">
            <h2 className="text-white text-xl font-bold mb-2">Submit Recycling Proof</h2>
            <p className="text-gray-400 mb-6">Submit this photo to earn 1 point!</p>
            <button
              onClick={handleSubmit}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/20"
            >
              <Check className="w-5 h-5" /> Submit Proof
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
