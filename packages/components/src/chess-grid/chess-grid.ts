import type { GoSign } from '../go-board/go-board';

export interface ChessGridProps {
  rows: GoSign[][]
}

export interface ChessGridSlotProps {
  sign: GoSign
  position: string
}
