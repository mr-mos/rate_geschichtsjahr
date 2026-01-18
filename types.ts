
export type CellStatus = "absent" | "present" | "correct" | "empty" | "tbd";

export type GameStatus = "playing" | "won" | "lost";

export interface Puzzle {
  id: string;
  year: string;
  hints: [string, string, string, string];
  title?: string;
  explanation?: string;
  source?: string;
}

export interface GameState {
  puzzleId: string;
  guesses: string[];
  status: GameStatus;
}
