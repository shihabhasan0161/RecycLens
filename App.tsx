import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CameraView } from './components/CameraView';
import { Waveform } from './components/Waveform';
import { GeminiLiveService } from './services/geminiLiveService';
import { ConnectionState } from './types';
import { Mic, MicOff, Camera, Loader2, Power } from 'lucide-react';

export default function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [volume, setVolume] = useState<number>(0);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const serviceRef = useRef<GeminiLiveService | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = new GeminiLiveService(
      (state) => setConnectionState(state),
      (vol, isOutput) => {
        setVolume(vol);
        setIsAiSpeaking(isOutput);
        
        // Reset speaking state after a short delay if no more volume
        if (isOutput) {
            // This is a simple visual debounce
            setTimeout(() => {
               if (vol < 0.01) setIsAiSpeaking(false);
            }, 200);
        }
      }
    );

    return () => {
      serviceRef.current?.disconnect();
    };
  }, []);

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
  }, []);

  const toggleSession = () => {
    if (connectionState === ConnectionState.CONNECTED || connectionState === ConnectionState.CONNECTING) {
      serviceRef.current?.disconnect();
    } else {
      if (videoRef.current) {
        serviceRef.current?.connect(videoRef.current);
      }
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING: return "Connecting to RecycLens...";
      case ConnectionState.CONNECTED: return isAiSpeaking ? "RecycLens is speaking..." : "Listening & Watching...";
      case ConnectionState.ERROR: return "Connection Error. Try Again.";
      default: return "Ready to Sort.";
    }
  };

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Background Camera */}
      <CameraView onVideoReady={handleVideoReady} />

      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-10 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Recyc<span className="text-green-400">Lens</span>
          </h1>
          <p className="text-sm text-gray-300 opacity-80">Voice & Vision Assistant</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${connectionState === ConnectionState.CONNECTED ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-white uppercase tracking-wider">
            {connectionState === ConnectionState.CONNECTED ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Main Interaction Area (Centered Overlay when active) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center z-10">
        {connectionState === ConnectionState.DISCONNECTED && (
           <div className="bg-black/60 backdrop-blur-sm p-6 rounded-2xl border border-white/10 max-w-sm text-center">
             <Camera className="w-12 h-12 text-green-400 mx-auto mb-4" />
             <h2 className="text-xl font-semibold text-white mb-2">Identify & Sort Waste</h2>
             <p className="text-gray-300 text-sm">
               Show items to the camera. RecycLens will tell you if it's recycling, compost, or trash.
             </p>
           </div>
        )}
      </div>

      {/* Bottom Controls & Status */}
      <div className="absolute bottom-0 left-0 w-full z-20 bg-gradient-to-t from-black/95 via-black/80 to-transparent pb-8 pt-12 px-6">
        
        {/* Dynamic Status / Waveform */}
        <div className="flex flex-col items-center justify-center mb-8 h-16">
          <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${isAiSpeaking ? 'text-green-400' : 'text-white/90'}`}>
            {getStatusText()}
          </p>
          
          {connectionState === ConnectionState.CONNECTED && (
            <Waveform 
              active={true} 
              volume={volume} 
              color={isAiSpeaking ? 'bg-green-400' : 'bg-blue-400'}
            />
          )}
        </div>

        {/* Primary Control Button */}
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={toggleSession}
            disabled={connectionState === ConnectionState.CONNECTING}
            className={`
              relative flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95
              ${connectionState === ConnectionState.CONNECTED 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                : 'bg-white hover:bg-gray-100 shadow-white/20'}
            `}
          >
            {connectionState === ConnectionState.CONNECTING ? (
              <Loader2 className="w-8 h-8 text-gray-800 animate-spin" />
            ) : connectionState === ConnectionState.CONNECTED ? (
              <Power className="w-8 h-8 text-white" />
            ) : (
              <div className="relative">
                <Mic className="w-8 h-8 text-gray-900" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
            )}
          </button>
        </div>
        
        {connectionState === ConnectionState.DISCONNECTED && (
          <p className="text-center text-xs text-gray-500 mt-6">
            Tap the microphone to start scanning
          </p>
        )}
      </div>
    </div>
  );
}
