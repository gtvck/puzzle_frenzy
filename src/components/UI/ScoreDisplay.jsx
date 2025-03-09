import React, { useEffect, useState } from 'react';

const ScoreDisplay = ({ score, level, highScore }) => {
  const [displayScore, setDisplayScore] = useState(score);
  const [isIncrementing, setIsIncrementing] = useState(false);
  
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

  return (
    <div className="flex justify-between items-center w-full max-w-4xl mb-4 px-4">
      <div className={`bg-gray-800 px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
        isIncrementing ? 'border-yellow-500 shadow-yellow-500/50 shadow-lg' : 'border-gray-700'
      }`}>
        <div className="text-xl text-white">
          <span className="font-bold text-yellow-400">Score:</span> 
          <span className={`ml-2 ${isIncrementing ? 'text-yellow-300' : ''}`}>
            {displayScore.toString().padStart(6, '0')}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="bg-gray-800 px-4 py-2 rounded-lg border-2 border-gray-700">
          <div className="text-xl text-white">
            <span className="font-bold text-green-400">Level:</span> 
            <span className="ml-2">{level}</span>
          </div>
        </div>
        
        {highScore > 0 && (
          <div className="bg-gray-800 px-4 py-2 rounded-lg border-2 border-gray-700">
            <div className="text-xl text-white">
              <span className="font-bold text-blue-400">Best:</span> 
              <span className="ml-2">{highScore.toString().padStart(6, '0')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreDisplay;