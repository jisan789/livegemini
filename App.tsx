import React, { useRef, useEffect } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import VideoView from './components/VideoView';
import ControlBar from './components/ControlBar';
import { ConnectionState } from './types';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { connectionState, connect, disconnect, volume } = useGeminiLive();

  // Helper to start the session, ensuring user interaction for AudioContext
  const handleConnect = async () => {
    if (videoRef.current) {
        await connect(videoRef.current);
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-950 flex flex-col relative overflow-hidden font-sans">
      {/* Background Decor (Subtle Grid) */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Header / Status */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <i className="fas fa-sparkles text-white text-sm"></i>
                </div>
                Gemini Live Vision
            </h1>
        </div>
        
        <div className={`flex items-center gap-2 backdrop-blur-md px-4 py-2 rounded-full border transition-all duration-300 ${
            connectionState === ConnectionState.CONNECTED ? 'bg-green-500/10 border-green-500/30' : 
            connectionState === ConnectionState.CONNECTING ? 'bg-yellow-500/10 border-yellow-500/30' : 
            'bg-gray-800/40 border-white/10'
        }`}>
             <div className={`w-2 h-2 rounded-full ${
                 connectionState === ConnectionState.CONNECTED ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 
                 connectionState === ConnectionState.CONNECTING ? 'bg-yellow-400 animate-pulse' : 
                 connectionState === ConnectionState.ERROR ? 'bg-red-500' : 'bg-gray-400'
             }`}></div>
             <span className="text-xs font-semibold text-white/90 uppercase tracking-widest">
                 {connectionState}
             </span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative z-10 flex items-center justify-center">
        <div className="relative w-full h-full max-w-[1920px] mx-auto bg-black shadow-2xl overflow-hidden">
            <VideoView videoRef={videoRef} />
            
            {/* Connection Overlay */}
            {connectionState === ConnectionState.DISCONNECTED && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-md z-20 p-6 text-center animate-fadeIn">
                    <div className="max-w-md w-full space-y-8">
                        
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                            <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-full w-full h-full flex items-center justify-center border border-gray-700 shadow-2xl">
                                <i className="fas fa-video text-3xl text-blue-400"></i>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-white tracking-tight">Connect with Gemini</h2>
                            <p className="text-gray-400 text-base leading-relaxed">
                                Experience a real-time, human-like video conversation. <br/>
                                Gemini sees your world and responds with a smile.
                            </p>
                        </div>

                        <button 
                            onClick={handleConnect}
                            className="group relative w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Start Conversation
                                <i className="fas fa-arrow-right text-sm opacity-50 group-hover:translate-x-1 transition-transform"></i>
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Controls */}
      <ControlBar 
        connectionState={connectionState}
        onConnect={handleConnect}
        onDisconnect={disconnect}
        volume={volume}
      />
    </div>
  );
};

export default App;