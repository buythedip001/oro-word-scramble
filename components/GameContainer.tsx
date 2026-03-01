import * as React from 'react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { generateWord } from '../services/geminiService';
import { WordData, Letter, GameStatus, GameStats } from '../types';
import LetterTile from './LetterTile';
import { Loader2, RefreshCw, Lightbulb, ArrowRight, AlertCircle, Timer, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';

const TIME_LIMITS = {
  Easy: 60,
  Medium: 90,
  Hard: 120
};

const GameContainer: React.FC<{
  stats: GameStats;
  updateStats: (success: boolean, points: number) => void;
}> = ({ stats, updateStats }) => {
  // Game State
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [availableLetters, setAvailableLetters] = useState<Letter[]>([]);
  const [placedLetters, setPlacedLetters] = useState<(Letter | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [shakeEffect, setShakeEffect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(60);

  const timerRef = useRef<number | null>(null);

  // Fetch new word
  const fetchNewWord = useCallback(async (difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium') => {
    setStatus(GameStatus.LOADING);
    setError(null);
    setHintVisible(false);
    
    // Clear any existing timer
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const data = await generateWord(difficulty);
      setWordData(data);
      initializeRound(data.word);
      
      // Set timer based on difficulty
      const time = TIME_LIMITS[difficulty] || 60;
      setTimeLeft(time);
      setTotalTime(time);
      
      setStatus(GameStatus.PLAYING);
    } catch (err) {
      setError("Failed to generate a word. Please try again.");
      setStatus(GameStatus.ERROR);
    }
  }, []);

  // Timer Logic
  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished in this tick
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleTimeout = () => {
    // Only trigger if we are currently playing
    setStatus(prev => {
      if (prev === GameStatus.PLAYING) {
        // Fill with correct letters for display
        if (wordData) {
            const correctLetters = wordData.word.split('').map((char, i) => ({ id: `reveal-${i}`, char }));
            setPlacedLetters(correctLetters);
        }
        
        updateStats(false, 0);
        return GameStatus.TIMEOUT;
      }
      return prev;
    });
  };

  // Initialize round helper
  const initializeRound = (word: string) => {
    // Create letter objects with unique IDs
    const letters: Letter[] = word.split('').map((char, index) => ({
      id: `${char}-${index}-${Date.now()}`,
      char
    }));

    // Fisher-Yates shuffle
    const shuffled = [...letters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Ensure not already solved by chance
    if (shuffled.map(l => l.char).join('') === word && word.length > 1) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    setAvailableLetters(shuffled);
    setPlacedLetters(new Array(word.length).fill(null));
  };

  // Initial load
  useEffect(() => {
    if (status === GameStatus.IDLE) {
      fetchNewWord('Easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleLetterClick = (letter: Letter, source: 'pool' | 'board', index?: number) => {
    if (status !== GameStatus.PLAYING) return;

    if (source === 'pool') {
      // Find first empty slot in placedLetters
      const firstEmptyIndex = placedLetters.findIndex(l => l === null);
      if (firstEmptyIndex !== -1) {
        // Move to board
        const newPlaced = [...placedLetters];
        newPlaced[firstEmptyIndex] = letter;
        setPlacedLetters(newPlaced);

        // Remove from available
        setAvailableLetters(prev => prev.filter(l => l.id !== letter.id));
      }
    } else if (source === 'board' && index !== undefined) {
      // Return to pool
      const letterToMove = placedLetters[index];
      if (letterToMove) {
        const newPlaced = [...placedLetters];
        newPlaced[index] = null;
        setPlacedLetters(newPlaced);
        setAvailableLetters(prev => [...prev, letterToMove]);
      }
    }
  };

  // Check Win Condition
  useEffect(() => {
    if (status !== GameStatus.PLAYING || !wordData) return;

    const currentWord = placedLetters.map(l => l ? l.char : '').join('');
    
    // Only check if word is complete
    if (currentWord.length === wordData.word.length) {
      if (currentWord === wordData.word) {
        handleWin();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedLetters, wordData, status]);

  const handleWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus(GameStatus.WON);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#060855', '#2c0c79', '#5e0933', '#045238']
    });
    
    // Calculate score
    let points = 100;
    if (wordData?.difficulty === 'Medium') points = 200;
    if (wordData?.difficulty === 'Hard') points = 300;
    
    // Add time bonus
    points += timeLeft * 2; // Bonus multiplier

    if (hintVisible) points = Math.floor(points / 2);

    updateStats(true, points);
  };

  const handleGiveUp = () => {
      if (!wordData) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const correctLetters = wordData.word.split('').map((char, i) => ({ id: `reveal-${i}`, char }));
      setPlacedLetters(correctLetters);
      setAvailableLetters([]);
      updateStats(false, 0);
      
      setStatus(GameStatus.TIMEOUT);
  };

  const checkIncorrect = () => {
     if (!wordData) return;
     const currentWord = placedLetters.map(l => l ? l.char : '').join('');
     if (currentWord.length === wordData.word.length && currentWord !== wordData.word) {
         setShakeEffect(true);
         setTimeout(() => setShakeEffect(false), 500);
     }
  };

  // Trigger incorrect shake when board is full but wrong
  useEffect(() => {
      if (status === GameStatus.PLAYING && wordData) {
          const isFull = placedLetters.every(l => l !== null);
          if (isFull) checkIncorrect();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placedLetters]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render Helpers
  if (status === GameStatus.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 animate-pulse">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-slate-300">Preparing your word...</h2>
        <p className="text-slate-500 mt-2">Shuffling letters for you</p>
      </div>
    );
  }

  if (status === GameStatus.ERROR) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button 
          onClick={() => fetchNewWord('Easy')}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const progressPercentage = (timeLeft / totalTime) * 100;
  const isLowTime = timeLeft <= 10 && status === GameStatus.PLAYING;

  return (
    <div className="w-full max-w-2xl mx-auto">
      
      {/* Difficulty, Info & Timer Bar */}
      <div className="flex flex-wrap justify-between items-center mb-6 px-2 gap-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider border
            ${wordData?.difficulty === 'Easy' ? 'bg-[#045238] text-green-400 border-green-500/20' : ''}
            ${wordData?.difficulty === 'Medium' ? 'bg-[#2c0c79] text-yellow-400 border-yellow-500/20' : ''}
            ${wordData?.difficulty === 'Hard' ? 'bg-[#5e0933] text-red-400 border-red-500/20' : ''}
          `}>
            {wordData?.difficulty.toUpperCase()}
          </span>
          <span className="text-black text-sm font-medium px-2 border-l border-slate-700">
            {wordData?.category}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          {status === GameStatus.PLAYING && (
            <div className={`flex items-center gap-2 font-mono font-bold text-lg transition-colors duration-300
              ${isLowTime ? 'text-[#ff8520] animate-pulse' : 'text-[#384344]'}
            `}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}

          {status === GameStatus.PLAYING && (
            <button 
                onClick={handleGiveUp}
                className="text-bold text-black-300 hover:text-[#ff8520] transition-colors underline decoration-slate-700 underline-offset-4"
            >
                Give Up
            </button>
          )}
        </div>
      </div>

      {/* Visual Timer Bar */}
      {status === GameStatus.PLAYING && (
        <div className="w-full h-1.5 bg-white rounded-full overflow-hidden mb-8 shadow-inner">
          <motion.div 
            className="h-full"
            animate={{ 
              width: `${progressPercentage}%`,
              backgroundColor: isLowTime ? '#ffffff' : '#ff831e'
            }}
            initial={{ width: "100%" }}
            transition={{ ease: "linear", duration: 1 }}
          />
        </div>
      )}

      {/* Status Message for Timeout/Loss */}
      {status === GameStatus.TIMEOUT && (
        <div className="mb-6 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-black font-bold text-xl mb-1 shadow-200">Time's Up!</p>
          <p className="text-black-200">The word was <span className="text-black font-bold"> {wordData?.word}</span> </p>
        </div>
      )}

      {/* Word Board Area */}
      <LayoutGroup>
      <div className={`bg-black/30 p-8 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-xl mb-8 transition-colors duration-300 ${shakeEffect ? 'translate-x-[-10px] border-red-500/50' : ''}`}>
        
        {/* Empty/Placed Slots */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 min-h-[80px]">
          {placedLetters.map((letter, idx) => (
            <div key={`slot-${idx}`} className="relative w-12 h-12 sm:w-14 sm:h-14">
               {letter ? (
                 <LetterTile 
                    char={letter.char} 
                    layoutId={letter.id}
                    index={idx}
                    onClick={() => handleLetterClick(letter, 'board', idx)}
                    status={status === GameStatus.WON ? 'correct' : status === GameStatus.TIMEOUT ? 'incorrect' : 'placed'}
                    disabled={status !== GameStatus.PLAYING}
                 />
               ) : (
                 <LetterTile status="empty" />
               )}
            </div>
          ))}
        </div>

        {/* Available Pool */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 min-h-[60px]">
           <AnimatePresence mode="popLayout">
             {availableLetters.map((letter) => (
               <LetterTile 
                  key={letter.id} 
                  layoutId={letter.id}
                  char={letter.char} 
                  onClick={() => handleLetterClick(letter, 'pool')}
                  disabled={status !== GameStatus.PLAYING}
               />
             ))}
           </AnimatePresence>
           {availableLetters.length === 0 && status === GameStatus.PLAYING && (
               <div className="h-12 sm:h-14 flex items-center text-slate-500 text-sm italic">
                   All letters placed
               </div>
           )}
        </div>
      </div>
      </LayoutGroup>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => setHintVisible(!hintVisible)}
            disabled={status !== GameStatus.PLAYING || hintVisible}
            className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all
                ${hintVisible 
                    ? 'bg-[#ff85205] border-indigo-500/30 text-indigo-300' 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-300 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'
                }
            `}
          >
            <Lightbulb className={`w-5 h-5 ${hintVisible ? 'text-blue-800 fill-blue-700' : ''}`} />
            <span className={hintVisible ? 'text-black font-semibold' : ''}>
              {hintVisible ? wordData?.hint : "Need a Hint?"}
            </span>
          </button>

          {status === GameStatus.WON || status === GameStatus.TIMEOUT ? (
              <button 
                onClick={() => fetchNewWord(wordData?.difficulty)} 
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[#ff8520] hover:bg-[#ff8520]/80 text-white font-bold shadow-lg shadow-[#ff8520]/20 transition-all"
              >
                <span>Next Word</span>
                <ArrowRight className="w-5 h-5" />
              </button>
          ) : (
             <button 
                onClick={() => {
                    // Reshuffle available
                    const shuffled = [...availableLetters];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    setAvailableLetters(shuffled);
                }}
                disabled={status !== GameStatus.PLAYING}
                className="flex items-center justify-center gap-2 p-4 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-750 text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <RefreshCw className="w-5 h-5" />
                <span>Shuffle Letters</span>
             </button>
          )}
      </div>

        {/* Difficulty Selectors for Next Round (Only show when finished) */}
        {(status === GameStatus.WON || status === GameStatus.TIMEOUT) && (
             <div className="mt-8 flex justify-center gap-2">
                 {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                     <button
                        key={diff}
                        onClick={() => fetchNewWord(diff)}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-slate-800 text-[#ff85205] hover:bg-slate-700 border border-slate-700 hover:text-white transition-all"
                     >
                         Play {diff}
                     </button>
                 ))}
             </div>
        )}

    </div>
  );
};

export default GameContainer;
