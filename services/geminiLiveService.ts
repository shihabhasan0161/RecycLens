import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { ConnectionState } from "../types";
import { SYSTEM_INSTRUCTION, MODEL_NAME } from "../constants";
import { createPcmBlob, decodeBase64, decodeAudioData, blobToBase64 } from "../utils/audioUtils";

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private videoInterval: number | null = null;
  private onStateChange: (state: ConnectionState) => void;
  private onVolumeChange: (volume: number, isOutput: boolean) => void;
  
  constructor(
    onStateChange: (state: ConnectionState) => void,
    onVolumeChange: (volume: number, isOutput: boolean) => void
  ) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.onStateChange = onStateChange;
    this.onVolumeChange = onVolumeChange;
  }

  async connect(videoElement: HTMLVideoElement) {
    try {
      this.onStateChange(ConnectionState.CONNECTING);

      // Initialize Audio Contexts
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Get User Media (Audio)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Connect to Gemini Live
      const sessionPromise = this.ai.live.connect({
        model: MODEL_NAME,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            this.onStateChange(ConnectionState.CONNECTED);
            this.startAudioInput(stream, sessionPromise);
            this.startVideoInput(videoElement, sessionPromise);
          },
          onmessage: (msg) => this.handleMessage(msg),
          onclose: () => {
            console.log("Gemini Live Session Closed");
            this.disconnect();
          },
          onerror: (err) => {
            console.error("Gemini Live Session Error", err);
            this.disconnect();
            this.onStateChange(ConnectionState.ERROR);
          }
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Friendly voice
          },
        },
      });
      
      this.session = await sessionPromise;

    } catch (error) {
      console.error("Failed to connect:", error);
      this.onStateChange(ConnectionState.ERROR);
      this.disconnect();
    }
  }

  private startAudioInput(stream: MediaStream, sessionPromise: Promise<any>) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for UI visualization
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onVolumeChange(rms, false);

      const pcmBlob = createPcmBlob(inputData);
      sessionPromise.then(session => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private startVideoInput(videoEl: HTMLVideoElement, sessionPromise: Promise<any>) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Send frames at 1 FPS to balance bandwidth/latency
    this.videoInterval = window.setInterval(async () => {
      if (!ctx || !videoEl || videoEl.paused || videoEl.ended) return;

      canvas.width = videoEl.videoWidth / 2; // Scale down slightly for performance
      canvas.height = videoEl.videoHeight / 2;
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (blob) {
          const base64Data = await blobToBase64(blob);
          sessionPromise.then(session => {
             session.sendRealtimeInput({
              media: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            });
          });
        }
      }, 'image/jpeg', 0.6); // 60% quality JPEG
    }, 1000); 
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio Output
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && this.outputAudioContext) {
      const pcmData = decodeBase64(base64Audio);
      
      // Calculate output volume for UI
      // Use a simple sampling for visualization since we don't have the full buffer decoded yet in main thread in some contexts,
      // but here we can decode first.
      
      try {
        const audioBuffer = await decodeAudioData(pcmData, this.outputAudioContext);
        
        // Simple RMS calc on the decoded buffer for visualizer trigger
        const chanData = audioBuffer.getChannelData(0);
        let sum = 0;
        // Sample just a portion for efficiency
        const step = Math.floor(chanData.length / 100) || 1;
        for (let i = 0; i < chanData.length; i+=step) {
          sum += chanData[i] * chanData[i];
        }
        const rms = Math.sqrt(sum / (chanData.length/step));
        this.onVolumeChange(rms, true);

        // Schedule playback
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        
        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputAudioContext.destination);
        source.start(this.nextStartTime);
        
        this.nextStartTime += audioBuffer.duration;

      } catch (e) {
        console.error("Error decoding audio", e);
      }
    }
  }

  disconnect() {
    this.onStateChange(ConnectionState.DISCONNECTED);
    
    if (this.videoInterval) {
      clearInterval(this.videoInterval);
      this.videoInterval = null;
    }

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.inputSource) {
      this.inputSource.disconnect();
      this.inputSource = null;
    }
    if (this.inputAudioContext) {
      this.inputAudioContext.close();
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      this.outputAudioContext.close();
      this.outputAudioContext = null;
    }
    // Note: LiveSession usually doesn't have a close method exposed directly in all versions of the SDK wrapper 
    // but we drop the reference. If there is a close method on the session object (wrapper), call it.
    // Assuming the sessionPromise pattern:
    // We just stop sending data.
    this.session = null;
  }
}