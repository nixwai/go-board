import type { GoSign } from '../types';

export interface ChessGridProps {
  rows: GoSign[][]
}

export interface ChessGridSlotProps {
  sign: GoSign
  position: string
}
