import React, { useEffect, useRef } from 'react';

interface CameraViewProps {
  onVideoReady: (video: HTMLVideoElement) => void;
}

export const CameraView: React.FC<CameraViewProps> = ({ onVideoReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Use back camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
             if (videoRef.current) {
               videoRef.current.play();
               onVideoReady(videoRef.current);
             }
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      // Cleanup tracks
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onVideoReady]);

  return (
    <div className="absolute inset-0 z-0 bg-black">
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
    </div>
  );
};
