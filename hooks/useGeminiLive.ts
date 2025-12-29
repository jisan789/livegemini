import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { ConnectionState, MessageLog } from '../types';
import { base64ToUint8Array, createAudioBlob, pcmToAudioBuffer } from '../utils/audioUtils';

// Configuration
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';
const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const VIDEO_FRAME_RATE_FPS = 2; // Keep low FPS for stability

export const useGeminiLive = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [volume, setVolume] = useState<number>(0);

  // Refs
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const videoIntervalRef = useRef<number | null>(null);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const disconnect = useCallback(async () => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            try {
                session.close();
            } catch (e) {
                console.warn("Error closing session", e);
            }
        }).catch(() => {}); // Ignore errors on close
        sessionPromiseRef.current = null;
    }

    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (audioContextRef.current) {
        try {
            audioContextRef.current.close();
        } catch(e) {}
        audioContextRef.current = null;
    }
    
    if (videoIntervalRef.current) {
        window.clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = null;
    }

    setConnectionState(ConnectionState.DISCONNECTED);
    setLogs(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Session ended.', timestamp: new Date() }]);
  }, []);

  const connect = useCallback(async (videoElement: HTMLVideoElement | null) => {
    try {
      setConnectionState(ConnectionState.CONNECTING);
      setLogs([]);

      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: OUTPUT_SAMPLE_RATE });
      audioContextRef.current = audioCtx;
      nextStartTimeRef.current = audioCtx.currentTime;

      // 2. Get Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play();
      }

      // 3. Connect to Gemini Live
      // Note: We assign the promise immediately so we can attach a catcher
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: `You are an intelligent, accurate, and warm AI video call companion.
            
            Key Behaviors:
            1. **Personality**: Speak with a genuine smile. Be friendly and human-like.
            2. **Accuracy**: Provide precise information about what you see.
            3. **Interaction**: React naturally. Keep the conversation flowing smoothly.`,
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            }
        },
        callbacks: {
          onopen: async () => {
            console.log('Gemini Live Session Opened');
            setConnectionState(ConnectionState.CONNECTED);
            
            // Resume AudioContext if suspended (browser policy)
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            // --- Audio Input Setup ---
            const inputCtx = new AudioContextClass({ sampleRate: INPUT_SAMPLE_RATE });
            const source = inputCtx.createMediaStreamSource(stream);
            
            // 4096 buffer = ~256ms latency @ 16kHz. 
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
                // Ensure we are still connected before processing
                if (!sessionPromiseRef.current) return;

                const inputData = e.inputBuffer.getChannelData(0);
                
                // Volume calc
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                setVolume(Math.min(rms * 5, 1));

                const blob = createAudioBlob(inputData);
                sessionPromise.then(session => session.sendRealtimeInput({ media: blob }))
                              .catch(e => { console.warn("Failed to send audio", e); });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            inputSourceRef.current = source;
            processorRef.current = scriptProcessor;

            // --- Video Input Setup ---
            if (videoElement) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                videoIntervalRef.current = window.setInterval(() => {
                    if (!ctx || !videoElement.videoWidth || !sessionPromiseRef.current) return;
                    
                    // Reduced MAX_WIDTH to 320px to prevent "Deadline Exceeded" / timeout issues
                    // This reduces payload size significantly while keeping enough context for AI.
                    const MAX_WIDTH = 320; 
                    const scale = Math.min(1, MAX_WIDTH / videoElement.videoWidth);
                    canvas.width = videoElement.videoWidth * scale;
                    canvas.height = videoElement.videoHeight * scale;
                    
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    
                    // Lower quality slightly to 0.5
                    const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                    
                    sessionPromise.then(session => session.sendRealtimeInput({
                        media: {
                            mimeType: 'image/jpeg',
                            data: base64
                        }
                    })).catch(e => { /* ignore video send fail */ });
                }, 1000 / VIDEO_FRAME_RATE_FPS);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
                const ctx = audioContextRef.current;
                const pcmBytes = base64ToUint8Array(audioData);
                const buffer = pcmToAudioBuffer(pcmBytes, ctx, OUTPUT_SAMPLE_RATE);
                
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                
                if (nextStartTimeRef.current < ctx.currentTime) {
                    nextStartTimeRef.current = ctx.currentTime;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
            }

            if (message.serverContent?.interrupted) {
                console.log('Model interrupted');
                nextStartTimeRef.current = audioContextRef.current?.currentTime || 0;
            }

            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
                 setLogs(prev => [...prev, { id: Date.now().toString(), role: 'model', text, timestamp: new Date() }]);
            }
          },
          onclose: () => {
            console.log('Gemini Live Session Closed');
            setConnectionState(ConnectionState.DISCONNECTED);
          },
          onerror: (err) => {
            console.error('Gemini Live Error:', err);
            setConnectionState(ConnectionState.ERROR);
            disconnect();
          }
        }
      });

      // Handle initial connection failure specifically
      sessionPromise.catch(err => {
        console.error("Connection Initialization Failed:", err);
        setConnectionState(ConnectionState.ERROR);
        disconnect();
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error('Connection setup failed:', error);
      setConnectionState(ConnectionState.ERROR);
      disconnect();
    }
  }, [disconnect, ai.live]);

  return {
    connectionState,
    connect,
    disconnect,
    volume,
    logs
  };
};