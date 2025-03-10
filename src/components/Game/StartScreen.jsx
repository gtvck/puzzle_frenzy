import React, { useEffect, useState } from 'react';

const StartScreen = ({ onStartGame }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [animated, setAnimated] = useState(false);
  
  // Apply animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-between w-full max-w-4xl px-4 py-4 h-full">
      <div className={`text-center mb-3 transition-all duration-1000 transform ${animated ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
        <h1 className="text-5xl font-bold text-white mb-4 font-pixel tracking-wider animate-pulse-slow">
          PIXEL FRENZY
        </h1>
        
        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-3 gap-3 w-40 md:w-48">
            {['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#44ff88', '#8844ff'].map((color, index) => (
              <div 
                key={index} 
                className="w-full h-12 md:h-14 rounded-md shadow-lg transform hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: color, 
                  boxShadow: `0 0 10px ${color}`,
                  animation: `pulse 2s infinite ${index * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        <p className="text-lg md:text-xl text-gray-300 mb-3">
          Match colorful blocks in this retro-style puzzle game!
        </p>
      </div>
      
      <div 
        className={`bg-gray-800 p-6 rounded-lg border-4 border-indigo-500 max-w-md w-full mb-8 transition-all duration-700 delay-300 transform ${animated ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}
      >
        {showInstructions ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-white font-pixel">How to Play</h2>
            <ul className="text-left text-gray-300 space-y-3 mb-4 text-sm md:text-base">
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Click on blocks to select them</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Swap adjacent blocks to match 3 or more of the same color</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Match blocks to score points</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Special blocks with stars give bonus points</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>Level up by scoring 100 points</span>
              </li>
              <li className="flex items-start">
                <span className="text-indigo-400 mr-2">•</span>
                <span>The game gets faster as you level up!</span>
              </li>
            </ul>
            <button
              className="mt-2 text-indigo-300 hover:text-indigo-100 underline text-sm flex items-center"
              onClick={() => setShowInstructions(false)}
            >
              <span className="transform rotate-180 inline-block mr-1">➤</span> Back
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-3 text-white font-pixel">Welcome!</h2>
            <p className="text-gray-300 mb-4">
              Ready to test your puzzle skills? Swap blocks to create matches and score points!
            </p>
            <button
              className="text-indigo-300 hover:text-indigo-100 underline text-sm flex items-center"
              onClick={() => setShowInstructions(true)}
            >
              How to play <span className="ml-1">➤</span>
            </button>
          </>
        )}
      </div>
      
      <div className={`mt-auto mb-6 w-full flex justify-center transition-all duration-700 delay-500 transform ${animated ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border-b-4 border-green-800 w-64 uppercase font-pixel"
          onClick={onStartGame}
        >
          Start Game
        </button>
      </div>
      
      <div className={`text-gray-500 text-xs text-center mb-2 transition-all duration-700 delay-700 ${animated ? 'opacity-100' : 'opacity-0'}`}>
        Made with 💙 for SNES lovers
      </div>
    </div>
  );
};

export default StartScreen;