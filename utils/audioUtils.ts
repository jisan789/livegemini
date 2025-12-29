import { Blob } from '@google/genai';

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Float32Array from AudioContext to Int16Array
export function float32To16BitPCM(float32Arr: Float32Array): Int16Array {
  const int16Arr = new Int16Array(float32Arr.length);
  for (let i = 0; i < float32Arr.length; i++) {
    // Clamp between -1 and 1
    const s = Math.max(-1, Math.min(1, float32Arr[i]));
    // Scale to 16-bit integer range
    int16Arr[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Arr;
}

// Convert Float32Array to the format Gemini expects
export function createAudioBlob(data: Float32Array): Blob {
  const int16Buffer = float32To16BitPCM(data);
  const base64 = arrayBufferToBase64(int16Buffer.buffer);
  
  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Convert PCM Int16 bytes from Gemini to AudioBuffer for playback
export function pcmToAudioBuffer(
  pcmData: Uint8Array,
  audioContext: AudioContext,
  sampleRate: number = 24000
): AudioBuffer {
  // Convert Uint8Array (bytes) to Int16Array
  const int16Array = new Int16Array(
    pcmData.buffer,
    pcmData.byteOffset,
    pcmData.byteLength / 2
  );

  const buffer = audioContext.createBuffer(1, int16Array.length, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Convert Int16 to Float32 [-1.0, 1.0]
  for (let i = 0; i < int16Array.length; i++) {
    channelData[i] = int16Array[i] / 32768.0;
  }

  return buffer;
}