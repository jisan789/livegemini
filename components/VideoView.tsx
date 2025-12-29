import React, { useEffect, useRef } from 'react';

interface VideoViewProps {
    videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoView: React.FC<VideoViewProps> = ({ videoRef }) => {
  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted // Muted because we handle audio streaming separately via AudioContext
        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
      />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 via-transparent to-black/30 pointer-events-none"></div>
    </div>
  );
};

export default VideoView;