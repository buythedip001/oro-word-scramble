import React from 'react';
import { GameStats } from '../types';
import { Trophy, Flame, BrainCircuit } from 'lucide-react';
import logo from "./IMAGE/oro.jpg";

interface HeaderProps {
  stats: GameStats;
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
  return (
    <header className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
        
        {/* Logo Area */}
        <div className="flex items-center gap-3">
          {/* render the imported logo */}
          <img
            src={logo}
            alt="ORO logo"
            className="w-12 h-12 rounded-full object-cover"
          />

          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              ORO Scramble Game
            </h1>
            <p className="text-xs text-slate-100">ORO Powered Word Game</p>
          </div>
        </div>

        {/* Stats Area */}
        <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Trophy className="w-4 h-4" />
            <span className="font-bold font-mono">{stats.score}</span>
          </div>
          <div className="w-px h-6 bg-slate-700"></div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Flame className="w-4 h-4" />
            <span className="font-bold font-mono">{stats.streak}</span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;