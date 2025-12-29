import React from 'react';
import Footer from './Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBullhorn, 
  faAmbulance, 
  faHospital, 
  faPills, 
  faClipboardList, 
  faTemperatureHigh, 
  faRobot, 
  faComments 
} from '@fortawesome/free-solid-svg-icons';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-2 flex-shrink-0 z-10 bg-white/90 pr-4">
              <div className="bg-primary p-1.5 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-slate-800 font-heading whitespace-nowrap">Amar Shastho AI</span>
            </div>

            {/* Scrolling Banner (Replaces Menu) */}
            <div className="flex-1 overflow-hidden relative h-full flex items-center ml-4 mask-gradient">
               <div className="animate-marquee whitespace-nowrap text-primary font-medium flex items-center space-x-8">
                  <span className="flex items-center">
                    <span className="mr-2 text-lg"><FontAwesomeIcon icon={faBullhorn} /></span> 
                    নতুন ফিচার: এখন ছবি আপলোড করে রোগের বিবরণ দিতে পারবেন!
                  </span>
                  <span className="flex items-center text-slate-400">|</span>
                  <span className="flex items-center">
                    <span className="mr-2 text-lg"><FontAwesomeIcon icon={faAmbulance} /></span> 
                    জরুরি প্রয়োজনে ১৬২৬৩ নম্বরে কল করুন
                  </span>
                  <span className="flex items-center text-slate-400">|</span>
                  <span className="flex items-center">
                    <span className="mr-2 text-lg"><FontAwesomeIcon icon={faHospital} /></span> 
                    ২৪/৭ বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন বিনামূল্যে
                  </span>
                  <span className="flex items-center text-slate-400">|</span>
                  <span className="flex items-center">
                    <span className="mr-2 text-lg"><FontAwesomeIcon icon={faPills} /></span> 
                    আপনার স্বাস্থ্য আমাদের অগ্রাধিকার
                  </span>
               </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="text-center max-w-4xl mx-auto z-10 animate-fade-in">
          <span className="inline-block py-1 px-3 rounded-full bg-teal-50 border border-teal-100 text-primary text-sm font-semibold mb-6">
            ২৪/৭ স্বাস্থ্য সেবা
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-secondary mb-6 font-heading leading-tight">
            বাংলাদেশের প্রথম স্মার্ট এআই ডাক্তার <br />
            <span className="text-primary">আপনার হাতের মুঠোয় চিকিৎসা</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            প্রাথমিক স্বাস্থ্য বিশ্লেষণ, বিশেষজ্ঞদের পরামর্শ এবং স্মার্ট মেডিকেল গাইডেন্স — সবকিছুই আপনার ভাষায়, সম্পূর্ণ বিনামূল্যে।
          </p>
          
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-primary rounded-full hover:bg-accent hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span>চ্যাট শুরু করুন</span>
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Developer Spotlight - Middle of Page */}
        <div className="w-full max-w-3xl mx-auto mt-12 mb-8 animate-slide-up z-10">
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-teal-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
               <p className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Designed & Developed By</p>
               <h2 className="text-4xl font-extrabold text-slate-800 mb-2 font-heading tracking-tight group-hover:text-primary transition-colors">
                 Jisan
               </h2>
               <p className="text-slate-500 font-medium mb-5">
                                 AI ENTHUSIAST
               </p>
               
               {/* Social Icons */}
               <div className="flex space-x-4">
                 <a href="https://www.facebook.com/jisancoder" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-full text-slate-600 hover:text-white hover:bg-[#1877F2] transition-all hover:-translate-y-1 shadow-sm">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                 </a>
                 <a href="https://www.instagram.com/itz_mdjisan/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-full text-slate-600 hover:text-white hover:bg-[#E4405F] transition-all hover:-translate-y-1 shadow-sm">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.465c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                   </svg>
                 </a>
               </div>
            </div>
          </div>
        </div>

        {/* Features/How it works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto w-full px-4 animate-slide-up">
          {[
            { icon: faClipboardList, title: "তথ্য দিন", desc: "আপনার নাম এবং বয়স দিন" },
            { icon: faTemperatureHigh, title: "সমস্যা বলুন", desc: "শারীরিক সমস্যার বিবরণ দিন" },
            { icon: faRobot, title: "স্মার্ট বিশ্লেষণ", desc: "AI সঠিক বিশেষজ্ঞ নির্বাচন করবে" },
            { icon: faComments, title: "পরামর্শ নিন", desc: "দ্রুত পরামর্শ এবং গাইডলাইন" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4 text-primary flex justify-center">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;