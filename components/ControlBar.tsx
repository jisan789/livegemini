import React from 'react';
import { ConnectionState } from '../types';

interface ControlBarProps {
  connectionState: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
  volume: number;
}

const ControlBar: React.FC<ControlBarProps> = ({ connectionState, onConnect, onDisconnect, volume }) => {
  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isConnecting = connectionState === ConnectionState.CONNECTING;

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-gray-900/60 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 shadow-2xl z-50 transition-all duration-300">
      
      {/* Visualizer */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        {/* Glow effect based on volume */}
        <div 
            className="absolute rounded-full bg-blue-500 blur-md transition-all duration-100 ease-out"
            style={{ 
                opacity: 0.2 + volume * 0.6,
                width: `${100 + volume * 80}%`, 
                height: `${100 + volume * 80}%` 
            }}
        />
        {/* Ring */}
        <div 
             className="absolute rounded-full border border-blue-400/30 transition-all duration-100 ease-out"
             style={{
                width: `${100 + volume * 40}%`,
                height: `${100 + volume * 40}%`
             }}
        ></div>
        
        {/* Icon */}
        <div className="relative z-10 w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
             <i className={`fas fa-microphone text-sm ${isConnected ? 'text-blue-400' : 'text-gray-500'}`}></i>
        </div>
      </div>

      <div className="h-10 w-px bg-white/10 mx-2"></div>

      {isConnected || isConnecting ? (
        <button
          onClick={onDisconnect}
          className="bg-red-500/90 hover:bg-red-500 text-white rounded-2xl p-4 w-16 h-14 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg shadow-red-500/20 active:scale-95"
          title="End Call"
        >
          <i className="fas fa-phone-slash text-xl"></i>
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="bg-white text-black hover:bg-gray-200 rounded-2xl p-4 w-16 h-14 flex items-center justify-center transition-all transform hover:scale-105 shadow-lg shadow-white/10 active:scale-95"
          title="Start Call"
        >
          <i className="fas fa-video text-xl"></i>
        </button>
      )}

      {isConnecting && (
         <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-full border border-gray-700 whitespace-nowrap animate-pulse">
            Connecting...
         </div>
      )}
    </div>
  );
};

export default ControlBar;