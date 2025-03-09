import React from 'react';
import PixelFrenzyPuzzle from './components/Game/PixelFrenzyPuzzle';
import './styles/tailwind.css';

function App() {
  return (
    <div className="App h-screen w-full bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="h-full w-full max-w-5xl flex items-center justify-center">
        <PixelFrenzyPuzzle />
      </div>
    </div>
  );
}

export default App;