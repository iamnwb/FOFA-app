export type Position = 'GK' | 'DEF' | 'MID' | 'ATT' | 'Any';

export type Player = {
  name: string;
  rating: number;          // 1–10 (can be decimal)
  isGK: boolean;           // true if an actual GK
  position: Position;      // their preferred position (or 'Any')
};