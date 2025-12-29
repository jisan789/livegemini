import React, { useEffect, useRef } from 'react';
import { SPECIALISTS } from '../constants';
import { DoctorId } from '../types';

interface SpecialistGridProps {
  selectedDoctorId?: DoctorId | null;
}

const SpecialistGrid: React.FC<SpecialistGridProps> = ({ selectedDoctorId }) => {
  const selectedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDoctorId && selectedRef.current) {
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [selectedDoctorId]);

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-surface">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">আমাদের বিশেষজ্ঞ ডাক্তারগণ</h2>
          <p className="text-slate-500">
            {selectedDoctorId 
              ? 'আপনার সমস্যার ভিত্তিতে উপযুক্ত ডাক্তার নির্বাচন করা হয়েছে...' 
              : 'AI আপনার জন্য সঠিক ডাক্তার খুঁজছে...'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {Object.values(SPECIALISTS).map((doctor) => {
            const isSelected = selectedDoctorId === doctor.id;
            
            return (
              <div
                key={doctor.id}
                ref={isSelected ? selectedRef : null}
                className={`
                  relative p-6 rounded-2xl transition-all duration-500 flex flex-col items-center text-center
                  ${isSelected 
                    ? 'bg-white border-2 border-primary shadow-xl scale-105 ring-4 ring-teal-50 z-10' 
                    : 'bg-white border border-slate-100 shadow-sm opacity-50 scale-95 grayscale'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute -top-3 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-md animate-bounce">
                    নির্বাচিত
                  </div>
                )}
                
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4
                  ${isSelected ? 'bg-teal-100 text-primary' : 'bg-slate-100 text-slate-400'}
                `}>
                  {doctor.name.charAt(0)}
                </div>
                
                <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                  {doctor.name}
                </h3>
                <p className={`text-sm mb-2 ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                  {doctor.specialty}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {doctor.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpecialistGrid;