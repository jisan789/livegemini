import React, { useState } from 'react';
import { GENDER_OPTIONS } from '../constants';
import { UserDetails } from '../types';

interface OnboardingFormProps {
  onSubmit: (details: UserDetails) => void;
  isLoading: boolean;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(GENDER_OPTIONS[0].value);
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && age && symptoms) {
      onSubmit({ name, age, gender, symptoms });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in">
      <div className="glass rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative">
        {/* Header decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
        
        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-secondary mb-2">আপনার তথ্য দিন</h2>
            <p className="text-slate-500 text-sm">সঠিক চিকিৎসা নিশ্চিত করতে নিচের তথ্যগুলো প্রয়োজন</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">আপনার নাম</label>
              <input
                type="text"
                required
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all placeholder-slate-400"
                placeholder="আপনার নাম লিখুন"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">বয়স</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all placeholder-slate-400"
                  placeholder="বয়স"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">লিঙ্গ</label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all appearance-none text-slate-700"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-2 ml-1">কী সমস্যা বা উপসর্গ হচ্ছে?</label>
              <textarea
                required
                rows={4}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all resize-none placeholder-slate-400"
                placeholder="উদাহরণ: আমার দুই দিন ধরে জ্বর এবং মাথা ব্যথা..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform duration-200 ${
                isLoading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-accent hover:shadow-xl hover:-translate-y-1 active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>বিশ্লেষণ করা হচ্ছে...</span>
                </div>
              ) : (
                'পরবর্তী ধাপ'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;