
import React from 'react';

interface KeyboardProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  disabled?: boolean;
}

const Keyboard: React.FC<KeyboardProps> = ({ onDigit, onDelete, onEnter, disabled }) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const btnBase = "h-11 md:h-16 rounded-lg md:rounded-xl font-bold transition-all duration-75 active:translate-y-1 active:shadow-none flex items-center justify-center disabled:opacity-50 touch-manipulation";

  return (
    <div className="w-full max-w-sm mx-auto mt-4 md:mt-10 grid grid-cols-3 gap-2 p-2 md:p-4 bg-slate-900/40 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/5 shadow-2xl">
      {digits.map((d) => (
        <button
          key={d}
          disabled={disabled}
          onClick={() => onDigit(d)}
          className={`${btnBase} bg-slate-800 border-b-2 md:border-b-4 border-slate-950 text-slate-100 hover:bg-slate-700 shadow-lg text-base md:text-xl`}
        >
          {d}
        </button>
      ))}
      <button
        disabled={disabled}
        onClick={onDelete}
        className={`${btnBase} bg-red-900/40 border-b-2 md:border-b-4 border-red-950 text-red-200 hover:bg-red-900/60 shadow-lg`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
        </svg>
      </button>
      <button
        disabled={disabled}
        onClick={() => onDigit('0')}
        className={`${btnBase} bg-slate-800 border-b-2 md:border-b-4 border-slate-950 text-slate-100 hover:bg-slate-700 shadow-lg text-base md:text-xl`}
      >
        0
      </button>
      <button
        disabled={disabled}
        onClick={onEnter}
        className={`${btnBase} bg-indigo-600 border-b-2 md:border-b-4 border-indigo-800 text-white hover:bg-indigo-500 shadow-lg col-span-1 text-xs md:text-base`}
      >
        OK
      </button>
    </div>
  );
};

export default Keyboard;
