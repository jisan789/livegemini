import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { DoctorId, UserDetails, ChatMessage, DoctorProfile } from "../types";
import { SPECIALISTS } from "../constants";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API Key is missing. Please ensure process.env.API_KEY is available.");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

// Schema for the orchestrator to ensure strict JSON output
const classificationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    specialistId: {
      type: Type.STRING,
      enum: Object.values(DoctorId),
      description: "The ID of the most suitable medical specialist based on the symptoms.",
    },
    reasoning: {
      type: Type.STRING,
      description: "Brief reasoning for the selection in Bangla.",
    },
  },
  required: ["specialistId", "reasoning"],
};

export const classifySymptoms = async (userDetails: UserDetails): Promise<{ specialistId: DoctorId; reasoning: string }> => {
  const model = "gemini-2.5-flash";
  
const prompt = `
User Profile:
Name: ${userDetails.name}
Age: ${userDetails.age} (If < 16, MUST be Pediatrician)
Gender: ${userDetails.gender}

Symptoms/Complaint: "${userDetails.symptoms}"

Task:
1. Analyze the user's symptoms, Age, and Gender.
2. Classify them into EXACTLY ONE medical specialty from the list below.
3. Return ONLY the corresponding ID.

STRICT CLASSIFICATION LOGIC (Priority Order):

1. **Pediatrician (${DoctorId.PEDIATRICIAN})**: 
   - **CRITICAL RULE**: IF Age is LESS THAN 16 (0-15), YOU MUST SELECT THIS, regardless of the symptom (Fever, Cough, Pain, Sexual issues etc.), unless it is clearly a pregnancy issue for an adolescent female (then Gynae).
   - IF Age >= 16, DO NOT SELECT PEDIATRICIAN.

2. **Gynecologist (${DoctorId.GYNECOLOGIST})**: 
   - **FEMALE PATIENTS ONLY**.
   - Issues: Pregnancy, Menstruation/Period problems, Uterus, Vaginal discharge/itching/pain, Breast lumps/pain, Lower abdominal pain (female specific).

3. **Dermatologist (${DoctorId.DERMATOLOGIST})**: 
   - **SKIN**: Acne, Rash, Itching, Eczema, Hair fall, Fungal infection, Ringworm.
   - **SEXUAL HEALTH & VENEREAL DISEASES (VD)**: 
     - **MALE GENITAL ISSUES**: Pain in penis, testicles, scrotum, foreskin issues.
     - **SEXUAL DYSFUNCTION**: Erectile dysfunction, premature ejaculation, weakness.
     - **STDs/STIs**: Syphilis, Gonorrhea, burning sensation in genitals, discharge from penis.
   - *Note: In this system, Dermatologist acts as the Sexologist/VD Specialist.*

4. **Psychiatrist (${DoctorId.PSYCHIATRIST})**: 
   - Depression, Anxiety, Panic, Insomnia (Sleep issues), Stress, Hallucinations, Suicide thoughts, OCD, Mental instability.

5. **ENT Specialist (${DoctorId.ENT})**: 
   - Ear (pain, discharge, hearing loss), Nose (blockage, bleeding, polyps, sinus), Throat (pain, tonsils, voice change, difficulty swallowing).

6. **Cardiologist (${DoctorId.CARDIOLOGIST})**: 
   - Chest pain (especially left side/center/pressure), High Blood Pressure (Hypertension), Palpitations (fast heartbeat), Shortness of breath (heart related).

7. **Neurologist (${DoctorId.NEUROLOGIST})**: 
   - Severe Headache (Migraine), Vertigo/Dizziness, Stroke/Paralysis, Seizures/Epilepsy, Tremors, Numbness in hands/feet, Nerve pain, Memory loss.

8. **Gastroenterologist (${DoctorId.GASTROENTEROLOGIST})**: 
   - Abdominal/Stomach pain, Gas/Acidity/Heartburn, Vomiting, Diarrhea, Constipation, Jaundice/Liver issues, Rectal bleeding, Piles/Fissure.

9. **Endocrinologist (${DoctorId.ENDOCRINOLOGIST})**: 
   - Diabetes, High Blood Sugar, Thyroid issues (Goiter, swelling neck, weight gain/loss), Hormonal imbalances, excessive thirst/hunger.

10. **Medicine Specialist (${DoctorId.MEDICINE})**: 
    - **GENERAL / FALLBACK**: Fever (Typhoid, Dengue, Viral), Cold/Flu (Adults), General weakness, Body aches, Joint pain (Arthritis), Urinary Tract Infections (Burning urine - if not clearly STI/VD), Kidney pain.
    - Use this ONLY if the symptom does not clearly fit the specialized categories above.

Reasoning Language: Bangla.
`;


  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: classificationSchema,
        temperature: 0.1, // Low temperature for deterministic classification
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    return result;
  } catch (error) {
    console.error("Error classifying symptoms:", error);
    // Fallback to Medicine specialist if classification fails
    return { specialistId: DoctorId.MEDICINE, reasoning: "লক্ষণগুলো পরিষ্কারভাবে বোঝা না যাওয়ায় মেডিসিন বিশেষজ্ঞের কাছে পাঠানো হলো।" };
  }
};

let chatSession: Chat | null = null;

export const initChatSession = (doctorId: DoctorId, userDetails: UserDetails) => {
  const doctor = SPECIALISTS[doctorId];
  
  const systemInstruction = `
    ${doctor.systemPrompt}

    USER CONTEXT:
    Name: ${userDetails.name}
    Age: ${userDetails.age}
    Gender: ${userDetails.gender}
    Initial Complaint: ${userDetails.symptoms}

    IMPORTANT ROLES & BEHAVIOR:
    1. **Language**: ALWAYS speak in Bangla (Bengali).
    2. **Persona**: You are ${doctor.name}, ${doctor.specialty}. You are NOT an AI assistant. You are a real, experienced doctor sitting in a clinic.
    3. **Tone**: Professional yet warm and confident. Use clinical authority. Do not sound robotic.
       - Instead of "I am an AI", say "আমি দেখছি" (I see) or "চিন্তার কারণ নেই" (No need to worry).
       - Use "বাবা/মা" for kids or young patients, and "আপনি" for adults.
    
    MEDICAL GUIDELINES & PRESCRIPTIONS (UPDATED):
    1. **OTC MEDICINES ALLOWED**: You **ARE PERMITTED** to suggest standard Over-The-Counter (OTC) medicines for symptom relief.
       - Examples: Napa/Ace (Paracetamol) for fever/pain, Orsaline for dehydration, Antacids/Seclo for gas, Histacin for mild allergy.
       - **Format**: When suggesting meds, write clearly: "ঔষধের নাম (Generic) - মাত্রা (Dosage) - কতদিন (Duration)".
       - Example: "Napa (Paracetamol 500mg) - ১টি করে দিনে ৩ বার (ভরা পেটে) - ৩ দিন"।
    2. **STRICT PROHIBITIONS**: 
       - ❌ NO Antibiotics (Azithromycin, Cefixime, etc.).
       - ❌ NO Sedatives/Sleeping pills.
       - ❌ NO Steroids.
       - If these are needed, tell the patient: "এজন্য আপনাকে একজন ডাক্তারকে সরাসরি দেখিয়ে অ্যান্টিবায়োটিক বা বিশেষ ঔষধ নিতে হবে।"
    3. **Diagnosis**: Give a "Provisional Diagnosis" (সম্ভাব্য রোগ) based on symptoms.
    4. **Reports**: Suggest relevant lab tests (CBC, X-ray, USG) if diagnosis is unclear.

    INTERACTION STYLE:
    - Don't ask too many questions at once. 1 or 2 at a time.
    - Keep responses concise (max 4-6 sentences) but informative.
    - If it's an emergency, use ⚠️ and tell them to go to a hospital.
  `;

  chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    },
  });

  return doctor;
};

export const sendMessageToDoctor = async (message: string, imageBase64?: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    let result;
    if (imageBase64) {
      // Extract mime type and data from base64 string
      const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/jpeg';
      const data = imageBase64.split(',')[1];

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      };
      const textPart = { text: message };
      
      // Pass parts as the message payload
      // @ts-ignore - The SDK handles mixed content parts dynamically
      result = await chatSession.sendMessage({ message: [textPart, imagePart] });
    } else {
      result = await chatSession.sendMessage({ message });
    }
    return result.text || "দুঃখিত, আমি বুঝতে পারিনি। আবার বলুন।";
  } catch (error) {
    console.error("Chat error:", error);
    return "সাময়িক যান্ত্রিক ত্রুটির কারণে উত্তর দেওয়া যাচ্ছে না। কিছুক্ষণ পর চেষ্টা করুন।";
  }
};

// New function to generate medical report summary
export interface MedicalReportData {
  diagnosis: string;
  summary: string;
  advice: string[];
  medications: string[];
  tests: string[];
}

export const generateMedicalReport = async (
  doctor: DoctorProfile,
  userDetails: UserDetails,
  chatHistory: ChatMessage[]
): Promise<MedicalReportData> => {
  
  // Convert chat history to string
  const conversationText = chatHistory
    .map(msg => `${msg.role === 'user' ? 'Patient' : 'Doctor'}: ${msg.text}`)
    .join('\n');

  // Modified prompt to explicitly ask for English output for PDF compatibility
  const prompt = `
    Analyze the following doctor-patient conversation (which may be in Bangla) and generate a structured medical report in ENGLISH.

    Patient Details:
    Name: ${userDetails.name}
    Age: ${userDetails.age}
    Gender: ${userDetails.gender}

    Conversation History:
    ${conversationText}

    Task:
    Extract the following information and translate it into clear, professional ENGLISH for a medical record:
    1. **diagnosis**: A short provisional diagnosis (e.g., Viral Fever, Migraine, Gastritis). If unclear, write "Observation needed".
    2. **summary**: A 2-line summary of the patient's main complaints and history in English.
    3. **advice**: A list of lifestyle advice given (e.g., drink water, rest) in English.
    4. **medications**: A list of suggested OTC medications mentioned. If none, return empty list. Translate instructions to English.
    5. **tests**: A list of suggested lab tests in English. If none, return empty list.

    Return ONLY valid JSON.
  `;

  const reportSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      diagnosis: { type: Type.STRING },
      summary: { type: Type.STRING },
      advice: { type: Type.ARRAY, items: { type: Type.STRING } },
      medications: { type: Type.ARRAY, items: { type: Type.STRING } },
      tests: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["diagnosis", "summary", "advice", "medications", "tests"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No report generated");
    
    return JSON.parse(text) as MedicalReportData;

  } catch (error) {
    console.error("Report generation failed:", error);
    return {
      diagnosis: "Unknown",
      summary: "Report generation failed.",
      advice: [],
      medications: [],
      tests: []
    };
  }
};