
import React from 'react';
import { CellStatus } from '../types';

interface CellProps {
  value: string;
  status: CellStatus;
  index?: number;
}

const Cell: React.FC<CellProps> = ({ value, status, index = 0 }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'correct':
        return 'bg-green-600 border-green-500 text-white shadow-[0_1px_0_0_rgba(21,128,61,1)] md:shadow-[0_4px_0_0_rgba(21,128,61,1)]';
      case 'present':
        return 'bg-yellow-500 border-yellow-400 text-white shadow-[0_1px_0_0_rgba(161,98,7,1)] md:shadow-[0_4px_0_0_rgba(161,98,7,1)]';
      case 'absent':
        return 'bg-red-900/80 border-red-700 text-red-200 shadow-[0_1px_0_0_rgba(127,29,29,1)] md:shadow-[0_4px_0_0_rgba(127,29,29,1)]';
      case 'tbd':
        return 'bg-slate-800 border-slate-600 text-white border-2 shadow-[0_4px_10px_rgba(0,0,0,0.3)]';
      case 'empty':
      default:
        return 'bg-slate-900/40 border-slate-700/50 border-2 text-white';
    }
  };

  const isRevealed = status === 'correct' || status === 'present' || status === 'absent';

  return (
    <div className="perspective-1000 w-8 h-11 md:w-16 md:h-20">
      <div
        className={`
          w-full h-full flex items-center justify-center 
          text-base md:text-4xl font-bold rounded-md md:rounded-xl
          transition-all duration-700 ease-out preserve-3d
          ${getStatusClasses()}
          ${isRevealed ? 'animate-flip-3d' : value ? 'scale-105' : 'scale-100'}
        `}
        style={{ 
          animationDelay: `${index * 150}ms`,
          transform: value && !isRevealed ? 'translateY(-0.5px)' : 'none'
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default Cell;
