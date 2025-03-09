import React from 'react';

const StartScreen = ({ onStartGame }) => {
  return (
    <div className="flex flex-col items-center justify-between w-full max-w-4xl px-4 py-4 h-full">
      <div className="text-center mb-3">
        <h1 className="text-4xl font-bold text-white mb-2 font-pixel">PIXEL FRENZY</h1>
        <div className="flex justify-center mb-2">
          <div className="grid grid-cols-3 gap-2 w-32">
            {['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8844', '#44ff88', '#8844ff'].map((color, index) => (
              <div 
                key={index} 
                className="w-9 h-9 rounded-md transform hover:scale-110 transition-transform"
                style={{ 
                  backgroundColor: color, 
                  boxShadow: `0 0 10px ${color}`,
                  animation: `pulse 2s infinite ${index * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
        <p className="text-lg text-gray-300 mb-3">Match colorful blocks in this retro-style puzzle game!</p>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg border-4 border-indigo-500 max-w-md w-full mb-4">
        <h2 className="text-xl font-bold mb-3 text-white">How to Play</h2>
        <ul className="text-left text-gray-300 space-y-2 mb-2 text-sm">
          <li>• Click on blocks to select them</li>
          <li>• Swap adjacent blocks to match 3 or more</li>
          <li>• Match blocks to score points</li>
          <li>• Special blocks give bonus points</li>
          <li>• Level up by scoring 100 points</li>
        </ul>
      </div>
      
      <div className="mt-auto mb-4 w-full flex justify-center">
        <button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border-b-4 border-green-800 w-64 uppercase font-pixel"
          onClick={onStartGame}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default StartScreen;