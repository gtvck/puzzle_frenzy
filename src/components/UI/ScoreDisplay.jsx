import React, { useEffect, useState, useRef } from 'react';

const ScoreDisplay = ({ score, level, highScore }) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [levelUpAnimation, setLevelUpAnimation] = useState(false);
  const prevLevelRef = useRef(level);
  
  // Animate score incrementing
  useEffect(() => {
    if (score > displayScore) {
      setIsIncrementing(true);
      
      // Increment the display score gradually
      const difference = score - displayScore;
      const increment = Math.max(1, Math.floor(difference / 10));
      
      const timer = setTimeout(() => {
        setDisplayScore(prev => Math.min(score, prev + increment));
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setIsIncrementing(false);
      setDisplayScore(score);
    }
  }, [score, displayScore]);
  
  // Animate level up
  useEffect(() => {
    if (level > prevLevelRef.current) {
      setLevelUpAnimation(true);
      
      const timer = setTimeout(() => {
        setLevelUpAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    prevLevelRef.current = level;
  }, [level]);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-4xl mb-4 px-4">
      <div className={`bg-gray-800 px-4 py-3 rounded-lg border-2 transition-all duration-300 mb-2 md:mb-0 ${
        isIncrementing ? 'border-yellow-500 shadow-yellow-500/50 shadow-lg' : 'border-gray-700'
      }`}>
        <div className="text-xl text-white">
          <span className="font-bold text-yellow-400 font-pixel">Score:</span> 
          <span className={`ml-2 font-pixel ${isIncrementing ? 'text-yellow-300' : ''}`}>
            {displayScore.toString().padStart(6, '0')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className={`bg-gray-800 px-4 py-3 rounded-lg border-2 ${
          levelUpAnimation 
            ? 'border-green-500 animate-pulse shadow-green-500/50 shadow-lg' 
            : 'border-gray-700'
        }`}>
          <div className="text-xl text-white">
            <span className="font-bold text-green-400 font-pixel">Level:</span> 
            <span className={`ml-2 font-pixel ${levelUpAnimation ? 'text-green-300' : ''}`}>
              {level}
            </span>
          </div>
        </div>
        
        {highScore > 0 && (
          <div className="bg-gray-800 px-4 py-3 rounded-lg border-2 border-gray-700">
            <div className="text-xl text-white">
              <span className="font-bold text-blue-400 font-pixel">Best:</span> 
              <span className="ml-2 font-pixel">{highScore.toString().padStart(6, '0')}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Level up notification */}
      {levelUpAnimation && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-slow">
          <div className="bg-green-600 bg-opacity-90 px-6 py-3 rounded-lg shadow-lg text-center">
            <p className="text-2xl font-bold text-white font-pixel">LEVEL UP!</p>
            <p className="text-lg text-green-200">Blocks will fall faster!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;