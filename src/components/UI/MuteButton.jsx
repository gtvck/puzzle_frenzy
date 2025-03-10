import React, { useState, useEffect } from 'react';

const MuteButton = ({ soundManager }) => {
  const [muted, setMuted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize mute state based on sound manager
  useEffect(() => {
    if (soundManager) {
      setMuted(soundManager.muted);
    }
  }, [soundManager]);

  // Toggle mute state
  const toggleMute = () => {
    if (soundManager) {
      // Resume audio context on user interaction
      soundManager.resume();
      
      const newMuted = soundManager.toggleMute();
      setMuted(newMuted);
      
      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
      
      // Play sound effect if unmuting
      if (!newMuted) {
        setTimeout(() => {
          soundManager.play('select');
        }, 100);
      }
    } else {
      setMuted(!muted);
    }
  };

  return (
    <button 
      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg transform ${
        isAnimating ? 'scale-110' : 'scale-100'
      } ${
        muted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
      }`}
      onClick={toggleMute}
      aria-label={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
};

export default MuteButton;