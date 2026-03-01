import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import GameContainer from './components/GameContainer';
import { GameStats } from './types';
import bg from "./bg/figg.jfif";

const App: React.FC = () => {
  const [stats, setStats] = useState<GameStats>(() => {
      const saved = localStorage.getItem('gemini-scramble-stats');
      return saved ? JSON.parse(saved) : { score: 0, streak: 0, wordsSolved: 0 };
  });

  useEffect(() => {
      localStorage.setItem('gemini-scramble-stats', JSON.stringify(stats));
  }, [stats]);

  const updateStats = (success: boolean, points: number) => {
      setStats(prev => ({
          score: prev.score + points,
          streak: success ? prev.streak + 1 : 0,
          wordsSolved: success ? prev.wordsSolved + 1 : prev.wordsSolved
      }));
  };

  return (
    <div
      className="relative min-h-screen w-full bg-[#e3b8a0] p-4 sm:p-6 md:p-8 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* subtle light overlay to make background appear lighter */}
      {/* added semi-transparent layer so background image is faded and text stands out */}
      <div className="absolute inset-0 bg-white/30 pointer-events-none z-0" />
 
        {/* Background Ambient Glows */}
        {/* <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]"></div>
        </div> */}

        <div className="relative z-10">
            <Header stats={stats} />
            
            <main className="flex flex-col items-center">
                <div className="w-full text-center mb-4">
                </div>
                
                <GameContainer stats={stats} updateStats={updateStats} />
                
                <footer className="mt-12 text-slate-600 text-sm text-center">
                    <p className='text-black font-semibold'><a href="https://x.com/GeorgeE31903" target="_blank" rel="noopener noreferrer">Built By BuyTheDip</a></p>
                </footer>
            </main>
        </div>
    </div>
  );
};

export default App;