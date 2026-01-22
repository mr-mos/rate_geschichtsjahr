
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PUZZLES } from './data/puzzles';
import { CellStatus, GameStatus, Puzzle, GameState } from './types';
import { evaluateGuess } from './utils/gameLogic';
import Cell from './components/Cell';
import Keyboard from './components/Keyboard';

const STORAGE_KEY = 'history-guesser-v1';

const App: React.FC = () => {
  const [puzzle, setPuzzle] = useState<Puzzle>(PUZZLES[0]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: GameState = JSON.parse(saved);
        const savedPuzzle = PUZZLES.find(p => p.id === parsed.puzzleId);
        if (savedPuzzle) {
          setPuzzle(savedPuzzle);
          setGuesses(parsed.guesses);
          setStatus(parsed.status);
        }
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    } else {
        startNewGame();
    }
  }, []);

  useEffect(() => {
    if (puzzle) {
        const state: GameState = {
            puzzleId: puzzle.id,
            guesses,
            status
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [puzzle, guesses, status]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const startNewGame = () => {
    const available = PUZZLES.filter(p => p.id !== puzzle?.id);
    const next = available[Math.floor(Math.random() * available.length)];
    setPuzzle(next);
    setGuesses([]);
    setCurrentGuess('');
    setStatus('playing');
    setToast(null);
  };

  const onEnter = useCallback(() => {
    if (status !== 'playing') return;
    if (currentGuess.length !== 4) {
      showToast("4 Ziffern nötig!");
      return;
    }

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    
    if (currentGuess === puzzle.year) {
      setStatus('won');
    } else if (newGuesses.length >= 4) {
      setStatus('lost');
    }

    setCurrentGuess('');
  }, [currentGuess, guesses, puzzle, status]);

  const onDelete = useCallback(() => {
    if (status !== 'playing') return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }, [status]);

  const onDigit = useCallback((digit: string) => {
    if (status !== 'playing' || currentGuess.length >= 4) return;
    setCurrentGuess(prev => prev + digit);
  }, [currentGuess, status]);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onEnter();
      if (e.key === 'Backspace') onDelete();
      if (/^\d$/.test(e.key)) onDigit(e.key);
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [onEnter, onDelete, onDigit]);

  const rows = useMemo(() => {
    const arr = [];
    const targetYear = parseInt(puzzle.year);

    for (let i = 0; i < 4; i++) {
      if (i < guesses.length) {
        const guessYear = parseInt(guesses[i]);
        let comparison: 'earlier' | 'later' | 'correct' = 'correct';
        if (guessYear < targetYear) comparison = 'later';
        else if (guessYear > targetYear) comparison = 'earlier';

        arr.push({ 
          guess: guesses[i], 
          results: evaluateGuess(guesses[i], puzzle.year),
          hint: puzzle.hints[i],
          comparison
        });
      } else if (i === guesses.length && status === 'playing') {
        arr.push({ 
          guess: currentGuess.padEnd(4, ' '), 
          results: Array(4).fill('tbd').map((s, idx) => idx < currentGuess.length ? 'tbd' : 'empty') as CellStatus[],
          hint: puzzle.hints[i],
          comparison: null
        });
      } else {
        arr.push({ 
          guess: '    ', 
          results: Array(4).fill('empty') as CellStatus[],
          hint: puzzle.hints[i],
          comparison: null
        });
      }
    }
    return arr;
  }, [guesses, currentGuess, puzzle, status]);

  return (
    <div className="min-h-screen flex flex-col items-center py-2 md:py-8 px-4 overflow-x-hidden">
      {/* Header */}
      <header className="text-center mb-4 md:mb-10 animate-fadeIn">
        <h1 className="text-3xl md:text-6xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-400 mb-0.5 md:mb-4 drop-shadow-sm">
          Chronos
        </h1>
        <div className="h-0.5 w-8 md:w-24 bg-gradient-to-r from-emerald-500 to-lime-500 mx-auto rounded-full mb-1 md:mb-4"></div>
        <p className="text-slate-400 text-[8px] md:text-base font-medium uppercase tracking-[0.2em]">
          Rate das Jahr der Geschichte
        </p>
      </header>

      {/* Main Game Area */}
      <main className="w-full max-w-4xl flex flex-col items-center perspective-1000">
        <div className="flex flex-col w-full transform md:rotateX(5deg)">
          {rows.map((row, i) => {
            const isHintVisible = i <= guesses.length || status !== 'playing';
            
            return (
              <div 
                key={i} 
                className={`flex flex-col lg:flex-row items-center gap-1 md:gap-4 lg:gap-8 w-full animate-slideUp transition-all duration-300 ${isHintVisible ? 'mb-4 md:mb-8' : 'mb-1 md:mb-4'}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex flex-col items-center group w-full lg:w-auto">
                  <div className="flex gap-1 md:gap-3">
                    {row.results.map((s, j) => (
                      <Cell key={j} value={row.guess[j].trim()} status={s} index={j} />
                    ))}
                  </div>
                  
                  {/* Indicator */}
                  <div className="h-3 mt-0.5 transition-all duration-500">
                    {row.comparison && row.comparison !== 'correct' && (
                      <div className="flex items-center gap-0.5 px-1 py-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[6px] md:text-[10px] uppercase font-black text-indigo-300 shadow-sm animate-bounceSubtle">
                        {row.comparison === 'later' ? (
                          <><span className="text-[8px] md:text-base leading-none">↑</span> SPÄTER</>
                        ) : (
                          <><span className="text-[8px] md:text-base leading-none">↓</span> FRÜHER</>
                        )}
                      </div>
                    )}
                    {row.comparison === 'correct' && (
                        <div className="flex items-center gap-0.5 px-1 py-0 rounded-full bg-green-500/10 border border-green-500/20 text-[6px] md:text-[10px] uppercase font-black text-green-400">
                            ✓ KORREKT
                        </div>
                    )}
                  </div>
                </div>
                
                {/* Hint Box: Hide if not visible to prevent blank space */}
                {isHintVisible ? (
                  <div className={`
                      flex-1 p-2 md:p-4 rounded-lg md:rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-xl min-h-0 md:min-h-[4rem] flex items-center
                      transition-all duration-500 ease-out w-full shadow-inner-white
                  `}>
                    <p className="text-[10px] md:text-lg font-medium text-slate-200 leading-tight md:leading-relaxed">
                      <span className="text-indigo-400 font-black mr-1.5 opacity-50">#0{i + 1}</span>
                      {row.hint}
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 lg:block hidden invisible"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status / UI Controls */}
        <div className="w-full max-w-xs md:max-w-md px-2">
            {status === 'playing' ? (
            <div className="mt-2 md:mt-8 animate-fadeIn">
                <Keyboard onDigit={onDigit} onDelete={onDelete} onEnter={onEnter} />
            </div>
            ) : (
            <div className="mt-4 md:mt-10 p-4 md:p-10 bg-slate-900/80 backdrop-blur-2xl rounded-xl md:rounded-[2.5rem] border border-indigo-500/30 text-center animate-popIn shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 animate-gradient-x"></div>
                <h2 className={`text-base md:text-4xl font-black mb-2 md:mb-3 ${status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                {status === 'won' ? 'Exzellent!' : 'Zeit abgelaufen'}
                </h2>
                <div className="inline-block px-3 py-0.5 md:px-6 md:py-2 bg-white/5 rounded-full text-sm md:text-3xl font-serif font-bold text-white mb-2 md:mb-3 border border-white/10 tracking-widest">
                    {puzzle.year}
                </div>
                <p className="text-slate-300 text-[9px] md:text-lg leading-relaxed mb-3 md:mb-8 italic px-1">
                    {puzzle.explanation}
                </p>
                <button 
                onClick={startNewGame}
                className="w-full py-2.5 md:py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black rounded-lg md:rounded-2xl transition-all shadow-lg active:scale-95 text-[10px] md:text-lg"
                >
                NÄCHSTE EPOCHE
                </button>
            </div>
            )}
        </div>
      </main>

      <footer className="mt-4 md:mt-12 text-slate-500 text-[6px] md:text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 pb-2">
        Chronos Engine v2.5 &bull; History Year Guesser
      </footer>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-slate-900 font-black rounded-full shadow-2xl animate-popIn z-50 text-[8px] md:text-sm tracking-widest border border-slate-900">
          {toast}
        </div>
      )}

      <style>{`
        @keyframes flip-3d {
          0% { transform: rotateX(0); }
          45% { transform: rotateX(90deg); opacity: 0.5; }
          100% { transform: rotateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.9) translateY(5px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5px); }
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-flip-3d { animation: flip-3d 0.8s cubic-bezier(0.455, 0.03, 0.515, 0.955); }
        .animate-slideUp { animation: slideUp 0.8s ease-out forwards; }
        .animate-popIn { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-bounceSubtle { animation: bounceSubtle 2s ease-in-out infinite; }
        .shadow-inner-white { box-shadow: inset 0 1px 1px rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
};

export default App;
