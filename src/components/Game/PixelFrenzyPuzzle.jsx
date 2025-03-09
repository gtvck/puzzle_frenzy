import React, { useState, useEffect } from 'react';
import GameBoard from './GameBoard';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import ScoreDisplay from '../UI/ScoreDisplay';
import MuteButton from '../UI/MuteButton';
import soundManager from './SoundManager';

const PixelFrenzyPuzzle = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [difficulty, setDifficulty] = useState(1);

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
  }, []);

  // Initialize sound manager
  useEffect(() => {
    try {
      soundManager.init();
    } catch (e) {
      console.error("Error initializing sound manager:", e);
    }
    
    return () => {
      try {
        soundManager.stopAll();
      } catch (e) {
        console.error("Error stopping sounds:", e);
      }
    };
  }, []);

  // Handle score updates
  const handleScoreUpdate = (points) => {
    setScore(prevScore => {
      const newScore = prevScore + points;
      
      // Update level based on score
      const newLevel = Math.floor(newScore / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        setDifficulty(prev => prev + 0.2); // Increase difficulty with each level
        try {
          soundManager.play('levelUp');
        } catch (e) {
          console.error("Error playing sound:", e);
        }
      }
      
      return newScore;
    });
  };

  // Handle game over
  const handleGameOver = () => {
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
  };

  // Handle game start
  const handleStartGame = () => {
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
  };

  // Handle game restart
  const handleRestart = () => {
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
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-h-screen overflow-auto">
      {!gameStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <>
          <div className="w-full max-w-4xl flex justify-between items-center mb-4 px-4">
            <ScoreDisplay score={score} level={level} highScore={highScore} />
            <MuteButton soundManager={soundManager} />
          </div>
          
          <GameBoard
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleGameOver}
            difficulty={difficulty}
          />
          
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