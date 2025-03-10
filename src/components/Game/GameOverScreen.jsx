import React, { useState, useEffect } from 'react';

const GameOverScreen = ({ score, highScore, onRestart }) => {
  // Animation state
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [particles, setParticles] = useState([]);
  
  // Check if this is a new high score
  const isNewHighScore = score > highScore;
  
  // Create confetti particles if it's a new high score
  useEffect(() => {
    if (isNewHighScore) {
      const newParticles = [];
      
      // Create 50 confetti particles
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -20 - Math.random() * 100,
          color: ['#ffff00', '#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#0000ff'][Math.floor(Math.random() * 6)],
          rotation: Math.random() * 360,
          size: Math.random() * 10 + 5,
          speed: Math.random() * 2 + 1
        });
      }
      
      setParticles(newParticles);
      setShowConfetti(true);
    }
    
    // Fade in animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isNewHighScore]);
  
  // Update confetti animation
  useEffect(() => {
    if (!showConfetti) return;
    
    const updateConfetti = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => ({
          ...particle,
          y: particle.y + particle.speed,
          rotation: particle.rotation + particle.speed * 2
        })).filter(particle => particle.y < 120) // Remove particles that have fallen off-screen
      );
    };
    
    const interval = setInterval(updateConfetti, 50);
    
    return () => clearInterval(interval);
  }, [showConfetti]);
  
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-50 overflow-hidden">
      {/* Confetti particles */}
      {showConfetti && particles.map(particle => (
        <div 
          key={particle.id}
          className="absolute"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size * 1.5}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: 0.8,
            transition: 'transform 0.1s linear'
          }}
        />
      ))}
      
      <div 
        className={`bg-gray-800 p-8 rounded-lg border-4 ${isNewHighScore ? 'border-yellow-500' : 'border-red-500'} max-w-md text-center transition-all duration-500 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}
      >
        <h2 className={`text-4xl font-bold mb-6 font-pixel ${isNewHighScore ? 'text-yellow-500' : 'text-red-500'}`}>
          Game Over
        </h2>
        
        <div className="bg-gray-900 p-5 rounded-lg mb-6">
          <p className="text-lg text-white mb-2">Your Score</p>
          <p className="text-3xl font-bold text-yellow-400 font-pixel">{score.toString().padStart(6, '0')}</p>
        </div>
        
        {isNewHighScore ? (
          <div className="bg-yellow-900 p-5 rounded-lg mb-6 animate-pulse-slow">
            <p className="text-lg text-yellow-200 mb-2 font-pixel">New High Score!</p>
            <div className="flex justify-center">
              {Array(5).fill().map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-blue-900 p-5 rounded-lg mb-6">
            <p className="text-lg text-blue-200 mb-2">Current High Score</p>
            <p className="text-2xl font-bold text-blue-300">{highScore.toString().padStart(6, '0')}</p>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border-b-4 border-blue-800 w-full font-pixel"
            onClick={onRestart}
          >
            Play Again
          </button>
          
          <div className="text-sm text-gray-400 mt-2">
            <p>Keep matching blocks to improve your score!</p>
            <p>Special blocks are worth more points.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;