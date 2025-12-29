
export enum DoctorId {
  MEDICINE = 'medicine',
  CARDIOLOGIST = 'cardiologist',
  NEUROLOGIST = 'neurologist',
  GASTROENTEROLOGIST = 'gastroenterologist',
  ENDOCRINOLOGIST = 'endocrinologist',
  GYNECOLOGIST = 'gynecologist',
  PEDIATRICIAN = 'pediatrician',
  DERMATOLOGIST = 'dermatologist',
  ENT = 'ent',
  PSYCHIATRIST = 'psychiatrist',
}

export interface DoctorProfile {
  id: DoctorId;
  name: string;
  englishName: string; // For PDF generation
  specialty: string; // In Bangla
  englishSpecialty: string; // For PDF generation
  description: string;
  systemPrompt: string;
}

export interface UserDetails {
  name: string;
  age: string;
  gender: string;
  symptoms: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64 string for images
  timestamp: Date;
}

export type AppState = 'LANDING' | 'ONBOARDING' | 'ANALYZING' | 'MATCHED' | 'CHATTING';
