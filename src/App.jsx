import React, { useEffect } from 'react';
import PixelFrenzyPuzzle from './components/Game/PixelFrenzyPuzzle';
import './styles/tailwind.css';

function App() {
  // Set up meta theme color for mobile browsers
  useEffect(() => {
    // Set page title
    document.title = 'Pixel Frenzy Puzzle';
    
    // Create or update theme-color meta tag for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.content = '#111827'; // Match bg-gray-900
    
    // Prevent scrolling on mobile
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  return (
    <div className="App h-screen w-full bg-gray-900 flex items-center justify-center overflow-hidden">
      <div className="h-full w-full max-w-5xl flex items-center justify-center">
        <PixelFrenzyPuzzle />
      </div>
      
      {/* Credits footer */}
      <div className="fixed bottom-2 right-2 text-gray-600 text-xs">
        Pixel Frenzy v1.0
      </div>
    </div>
  );
}

export default App;