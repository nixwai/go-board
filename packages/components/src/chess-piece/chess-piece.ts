import type { GoSign } from '../go-board/go-board';

export interface ChessPieceProps {
  sign: Exclude<GoSign, 0>
  preview?: boolean
}
