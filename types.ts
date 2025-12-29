export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface MessageLog {
  id: string;
  role: 'user' | 'model';
  text?: string;
  timestamp: Date;
}

export interface LiveConfig {
  model: string;
  voiceName: string;
}