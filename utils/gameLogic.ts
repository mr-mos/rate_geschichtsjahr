
import { CellStatus } from '../types';

/**
 * Evaluates a guess against a target year.
 * Handles duplicate digits correctly (Wordle rules).
 */
export const evaluateGuess = (guess: string, target: string): CellStatus[] => {
  if (guess.length !== 4 || target.length !== 4) return Array(4).fill('absent');

  const results: CellStatus[] = Array(4).fill('absent');
  const targetCounts: Record<string, number> = {};

  // Fill target digit counts
  for (const char of target) {
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }

  // First pass: identify correct positions
  for (let i = 0; i < 4; i++) {
    if (guess[i] === target[i]) {
      results[i] = 'correct';
      targetCounts[guess[i]]--;
    }
  }

  // Second pass: identify present digits (wrong position)
  for (let i = 0; i < 4; i++) {
    if (results[i] !== 'correct') {
      const digit = guess[i];
      if (targetCounts[digit] > 0) {
        results[i] = 'present';
        targetCounts[digit]--;
      }
    }
  }

  return results;
};

export const getDailyPuzzleId = (puzzleCount: number): number => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % puzzleCount;
};
