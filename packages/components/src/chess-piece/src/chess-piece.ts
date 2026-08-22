import type { GoSign } from '../../types';

export interface ChessPieceProps {
  sign: Exclude<GoSign, 0>
  preview?: boolean
}
