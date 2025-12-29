import React, { useEffect, useRef, useState } from 'react';
import { DoctorProfile, ChatMessage, UserDetails } from '../types';
import { sendMessageToDoctor, generateMedicalReport, MedicalReportData } from '../services/geminiService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faImage, faTimes, faStethoscope, faShieldAlt, faFilePdf, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { jsPDF } from 'jspdf';

interface ChatInterfaceProps {
  doctor: DoctorProfile;
  initialMessage: string;
  onClose: () => void;
}

export default function ChatInterface({ doctor, initialMessage, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize chat
  useEffect(() => {
    const introMsg: ChatMessage = {
      id: 'init-1',
      role: 'model',
      text: `আসসালামু আলাইকুম। আমি ${doctor.name}, ${doctor.specialty}।\nআপনার সমস্যাটি বিস্তারিত বলুন, আমি সাহায্য করার চেষ্টা করছি।`,
      timestamp: new Date(),
    };
    setMessages([introMsg]);
  }, [doctor]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const responseText = await sendMessageToDoctor(userMsg.text, userMsg.image);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Failed to send message", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "দুঃখিত, সংযোগে সমস্যা হয়েছে। দয়া করে পেজটি রিফ্রেশ করুন।",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (messages.length < 3) {
      alert("রিপোর্ট তৈরি করার জন্য আরও কিছু কথোপকথন প্রয়োজন।");
      return;
    }

    setIsGeneratingReport(true);

    try {
      // Mock user details since we didn't pass them in props. 
      const dummyUser: UserDetails = {
        name: "Patient",
        age: "--",
        gender: "--",
        symptoms: initialMessage
      };

      // Ensure report is generated in English for PDF compatibility
      const reportData = await generateMedicalReport(doctor, dummyUser, messages);
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Header Background
      doc.setFillColor(0, 167, 167); // Primary Color
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("AMAR SHASTHO AI", pageWidth / 2, 15, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Smart Telemedicine Report", pageWidth / 2, 25, { align: "center" });

      // Doctor Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      // Use English Name for PDF
      doc.text(`Consultant: ${doctor.englishName}`, 20, 55);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      // Use English Specialty for PDF
      doc.text(doctor.englishSpecialty, 20, 60);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 60, 55);

      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 65, pageWidth - 20, 65);

      let yPos = 80;

      // Helper for sections
      const addSection = (title: string, content: string | string[]) => {
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(12);
        doc.setTextColor(0, 167, 167); // Primary
        doc.setFont("helvetica", "bold");
        doc.text(title.toUpperCase(), 20, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0); // Black
        doc.setFont("helvetica", "normal");
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                const lines = doc.splitTextToSize(`• ${item}`, pageWidth - 40);
                doc.text(lines, 20, yPos);
                yPos += (lines.length * 5) + 2;
            });
        } else {
            const lines = doc.splitTextToSize(content, pageWidth - 40);
            doc.text(lines, 20, yPos);
            yPos += (lines.length * 5) + 5;
        }
        yPos += 5;
      };

      // Add Sections
      addSection("Provisional Diagnosis", reportData.diagnosis);
      addSection("Clinical Summary", reportData.summary);

      if (reportData.medications.length > 0) {
        addSection("Suggested Medications (OTC)", reportData.medications);
      }

      addSection("Advice & Lifestyle", reportData.advice);

      if (reportData.tests.length > 0) {
        addSection("Recommended Tests", reportData.tests);
      }

      // Footer with Developer Info
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.setFont("helvetica", "bold");
      doc.text("Developed by Jisan | AI Enthusiast", pageWidth / 2, pageHeight - 18, { align: "center" });
      
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Disclaimer: This report is generated by AI. It is not a substitute for a physical doctor's consultation.", pageWidth / 2, pageHeight - 10, { align: "center" });

      doc.save(`AmarShastho_Report_${Date.now()}.pdf`);

    } catch (error) {
      console.error("PDF Error", error);
      alert("PDF তৈরি করতে সমস্যা হয়েছে।");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* 1. Stylish Header */}
      <div className="flex-none bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100 shadow-sm z-30">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-50 to-teal-100 border border-teal-200 flex items-center justify-center text-primary font-bold text-xl shadow-inner">
              <FontAwesomeIcon icon={faStethoscope} />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{doctor.name}</h3>
            <div className="flex items-center text-sm text-slate-500">
               <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-medium border border-teal-100">
                 {doctor.specialty}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
            {/* PDF Report Button */}
            <button
                onClick={handleGeneratePDF}
                disabled={isGeneratingReport || messages.length < 3}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isGeneratingReport || messages.length < 3
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                }`}
            >
                {isGeneratingReport ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                    <FontAwesomeIcon icon={faFilePdf} />
                )}
                <span className="hidden sm:inline">Rx Report</span>
            </button>

            <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
            title="চ্যাট শেষ করুন"
            >
            <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
        </div>
      </div>

      {/* 2. Messages Area (Flex-1 handles remaining height) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold mr-3 mt-1 shadow-sm hidden md:flex">
                <FontAwesomeIcon icon={faStethoscope} />
              </div>
            )}
            
            <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-5 py-3.5 shadow-md text-[15px] leading-relaxed relative ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary to-accent text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white text-slate-700 border border-slate-50 rounded-2xl rounded-tl-sm'
                }`}
              >
                {msg.image && (
                  <div className="mb-3 overflow-hidden rounded-lg border border-white/20">
                    <img src={msg.image} alt="Uploaded" className="max-w-full w-60 h-auto object-cover" />
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium select-none">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start w-full animate-pulse">
             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex-shrink-0 flex items-center justify-center text-primary text-xs font-bold mr-3 mt-1 shadow-sm hidden md:flex">
                <FontAwesomeIcon icon={faStethoscope} />
             </div>
             <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm flex items-center space-x-1.5 h-12">
               <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* 3. Bottom Input Section (Fixed at bottom of flex container) */}
      <div className="flex-none bg-white z-20 shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.1)]">
        
        {/* Warning Banner */}
        <div className="bg-orange-50 border-y border-orange-100 py-2 px-4 flex items-center justify-center space-x-2">
           <FontAwesomeIcon icon={faShieldAlt} className="text-orange-500 text-xs" />
           <p className="text-[11px] text-orange-600 font-medium text-center">
             জরুরি মুহূর্তে অ্যাপ ব্যবহার না করে সরাসরি হাসপাতালে যোগাযোগ করুন।
           </p>
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center animate-fade-in">
            <div className="relative group">
              <img src={selectedImage} alt="Preview" className="h-14 w-14 object-cover rounded-lg border border-slate-300 shadow-sm" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} size="xs" />
              </button>
            </div>
            <span className="ml-3 text-xs text-slate-500 font-medium">ছবি সংযুক্ত করা হয়েছে</span>
          </div>
        )}

        {/* Input Form */}
        <div className="p-4">
          <div className="flex items-end space-x-2 max-w-4xl mx-auto">
             {/* File Upload Button */}
             <div className="flex-shrink-0 mb-1">
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-full transition-all duration-200 border ${selectedImage ? 'bg-teal-50 border-teal-200 text-primary' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                  title="ছবি যুক্ত করুন"
                >
                  <FontAwesomeIcon icon={faImage} size="lg" />
                </button>
             </div>

             {/* Text Input */}
             <div className="flex-grow relative">
                <textarea
                  className="w-full border border-slate-200 rounded-2xl pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-slate-50 transition-all text-slate-800 placeholder-slate-400 resize-none leading-relaxed custom-scrollbar"
                  placeholder="আপনার বার্তা লিখুন..."
                  rows={1}
                  style={{ minHeight: '50px', maxHeight: '120px' }}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    // Auto-resize
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isTyping}
                />
             </div>
            
             {/* Send Button */}
             <div className="flex-shrink-0 mb-1">
               <button
                  onClick={handleSendMessage}
                  disabled={(!inputValue.trim() && !selectedImage) || isTyping}
                  className={`p-3 rounded-full transition-all duration-200 shadow-sm ${
                    (!inputValue.trim() && !selectedImage) || isTyping
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-accent hover:shadow-md hover:scale-105 active:scale-95'
                  }`}
                >
                  <FontAwesomeIcon icon={faPaperPlane} size="lg" />
                </button>
             </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">AI ভুল করতে পারে। চিকিৎসকের পরামর্শ চূড়ান্ত বলে গণ্য হবে।</p>
          </div>
        </div>
      </div>
    </div>
  );
}