import React, { useState, useEffect, useCallback } from 'react';
import GameBoard from './GameBoard';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import ScoreDisplay from '../UI/ScoreDisplay';
import MuteButton from '../UI/MuteButton';
import soundManager from '../../utils/SoundManager';

const PixelFrenzyPuzzle = () => {
  // Game state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load high score from localStorage
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('pixelFrenzyHighScore');
      if (savedHighScore) {
        setHighScore(parseInt(savedHighScore, 10));
      }
    } catch (e) {
      console.error("Error loading high score:", e);
    }
    
    // Initialize sound manager
    try {
      soundManager.init();
      // We need a short delay to ensure audio context is ready
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    } catch (e) {
      console.error("Error initializing sound manager:", e);
      setIsLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      try {
        soundManager.stopAll();
      } catch (e) {
        console.error("Error stopping sounds:", e);
      }
    };
  }, []);

  // Handle score updates
  const handleScoreUpdate = useCallback((points) => {
    setScore(prevScore => {
      const newScore = prevScore + points;
      
      // Play sound effect based on points
      try {
        if (points >= 50) {
          soundManager.play('levelUp');
        } else {
          soundManager.play('match');
        }
      } catch (e) {
        console.error("Error playing sound:", e);
      }
      
      return newScore;
    });
  }, []);
  
  // Update level based on score
  useEffect(() => {
    // Calculate level based on score
    const newLevel = Math.floor(score / 100) + 1;
    
    if (newLevel > level) {
      setLevel(newLevel);
      setDifficulty(prev => Math.min(prev + 0.2, 3)); // Cap difficulty at 3
      
      try {
        soundManager.play('levelUp');
      } catch (e) {
        console.error("Error playing sound:", e);
      }
    }
  }, [score, level]);

  // Handle game over
  const handleGameOver = useCallback(() => {
    // Check for high score
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem('pixelFrenzyHighScore', score.toString());
      } catch (e) {
        console.error("Error saving high score:", e);
      }
    }
    
    setGameOver(true);
    
    try {
      soundManager.play('gameOver');
      soundManager.stopBgm();
    } catch (e) {
      console.error("Error with game over sounds:", e);
    }
  }, [score, highScore]);

  // Handle game start
  const handleStartGame = useCallback(() => {
    // Resume audio context on user interaction
    try {
      if (soundManager.audioContext && soundManager.audioContext.state === 'suspended') {
        soundManager.audioContext.resume();
      }
    } catch (e) {
      console.error("Error resuming audio context:", e);
    }
    
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setDifficulty(1);
    
    try {
      soundManager.play('start');
      soundManager.playBgm();
    } catch (e) {
      console.error("Error with game start sounds:", e);
    }
  }, []);

  // Handle game restart
  const handleRestart = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setDifficulty(1);
    
    try {
      soundManager.play('start');
      soundManager.playBgm();
    } catch (e) {
      console.error("Error with game restart sounds:", e);
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-h-screen overflow-auto">
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <>
          <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4 animate-fadeIn">
            <ScoreDisplay score={score} level={level} highScore={highScore} />
            <MuteButton soundManager={soundManager} />
          </div>
          
          <div className={`w-full max-w-4xl ${gameOver ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
            <GameBoard
              onScoreUpdate={handleScoreUpdate}
              onGameOver={handleGameOver}
              difficulty={difficulty}
            />
          </div>
          
          {gameOver && (
            <GameOverScreen 
              score={score} 
              highScore={highScore}
              onRestart={handleRestart}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PixelFrenzyPuzzle;