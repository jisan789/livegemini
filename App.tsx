import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import OnboardingForm from './components/OnboardingForm';
import ChatInterface from './components/ChatInterface';
import SpecialistGrid from './components/SpecialistGrid';
import Footer from './components/Footer';
import { AppState, DoctorProfile, UserDetails, DoctorId } from './types';
import { classifySymptoms, initChatSession } from './services/geminiService';
import { SPECIALISTS } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('LANDING');
  const [currentDoctor, setCurrentDoctor] = useState<DoctorProfile | null>(null);
  const [userSymptoms, setUserSymptoms] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const handleStart = () => {
    setAppState('ONBOARDING');
  };

  const handleOnboardingSubmit = async (details: UserDetails) => {
    setIsLoading(true);
    setUserDetails(details);
    setUserSymptoms(details.symptoms);
    
    // Move to ANALYZING immediately to show grid
    setAppState('ANALYZING');

    try {
      // Step 1: Classify (Artificial delay for UX if needed, but Gemini takes time anyway)
      const classification = await classifySymptoms(details);
      
      // Step 2: Initialize Chat Config
      const doctor = initChatSession(classification.specialistId, details);
      
      // Step 3: Show the match
      setCurrentDoctor(doctor);
      setAppState('MATCHED');

      // Step 4: Delay before chatting to let user see the match
      setTimeout(() => {
        setAppState('CHATTING');
      }, 3000);

    } catch (error) {
      console.error("Error during onboarding flow:", error);
      alert("দুঃখিত, একটি সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      setAppState('ONBOARDING');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseChat = () => {
    // Reset necessary state and go back to landing
    setAppState('LANDING');
    setCurrentDoctor(null);
    setUserDetails(null);
    setUserSymptoms('');
  };

  // Determine if the view should be fixed height (no window scroll) or scrollable
  const isFixedScreen = appState === 'CHATTING' || appState === 'ANALYZING' || appState === 'MATCHED';

  return (
    <div className={`w-full bg-[#F7F9FA] font-sans ${isFixedScreen ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      
      {appState === 'LANDING' && (
        <LandingPage onStart={handleStart} />
      )}

      {appState === 'ONBOARDING' && (
        <div className="min-h-screen flex flex-col relative bg-surface">
           {/* Simple Navbar for internal pages */}
           <div className="w-full bg-white/80 backdrop-blur-sm p-4 border-b border-slate-100 absolute top-0 z-10">
             <div className="max-w-7xl mx-auto flex items-center cursor-pointer" onClick={() => setAppState('LANDING')}>
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-2">
                   <span className="text-white font-bold">AS</span>
                </div>
                <span className="font-bold text-slate-700">Amar Shastho AI</span>
             </div>
           </div>

           <div className="flex-grow flex items-center justify-center p-4 pt-20">
              <OnboardingForm onSubmit={handleOnboardingSubmit} isLoading={isLoading} />
           </div>
           
           <Footer />
        </div>
      )}

      {(appState === 'ANALYZING' || appState === 'MATCHED') && (
        <div className="h-full w-full flex flex-col">
          <div className="flex-grow">
            {/* Pass current doctor ID if matched, otherwise null */}
            <SpecialistGrid selectedDoctorId={currentDoctor?.id} />
          </div>
          {/* We hide footer here to focus on the selection process or keep it, let's keep it consistent */}
        </div>
      )}

      {appState === 'CHATTING' && currentDoctor && (
        <div className="h-full w-full flex flex-col">
           {/* Mobile header handled inside ChatInterface, Desktop wrapper here */}
           <div className="flex-grow max-w-5xl mx-auto w-full bg-white shadow-2xl h-full sm:h-[90vh] sm:mt-[5vh] sm:rounded-3xl overflow-hidden sm:border border-slate-100">
              <ChatInterface 
                doctor={currentDoctor} 
                initialMessage={userSymptoms} 
                onClose={handleCloseChat}
              />
           </div>
           {/* On mobile full screen, on desktop centered */}
        </div>
      )}
    </div>
  );
};

export default App;