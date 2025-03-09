import React from 'react';

const GameOverScreen = ({ score, highScore, onRestart }) => {
  // Check if this is a new high score
  const isNewHighScore = score > highScore;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50 animate-fadeIn">
      <div className="bg-gray-800 p-8 rounded-lg border-4 border-red-500 max-w-md text-center transform transition-all duration-500 animate-scaleIn">
        <h2 className="text-4xl font-bold mb-6 text-red-500">Game Over</h2>
        
        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <p className="text-lg text-white mb-2">Your Score</p>
          <p className="text-3xl font-bold text-yellow-400">{score.toString().padStart(6, '0')}</p>
        </div>
        
        {isNewHighScore && (
          <div className="bg-yellow-900 p-4 rounded-lg mb-6 animate-pulse">
            <p className="text-lg text-yellow-200 mb-1">New High Score!</p>
            <div className="flex justify-center">
              {Array(5).fill().map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border-b-4 border-blue-800 w-full"
            onClick={onRestart}
          >
            Play Again
          </button>
          
          <div className="text-sm text-gray-400 mt-4">
            <p>Keep matching blocks to improve your score!</p>
            <p>Special blocks are worth more points.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;