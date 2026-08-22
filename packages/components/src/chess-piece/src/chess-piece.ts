import type { GoSign } from '../../types';

/** 棋子组件的输入属性。 */
export interface ChessPieceProps {
  /** 棋子颜色，1 表示黑子，-1 表示白子。 */
  sign: Exclude<GoSign, 0>
  /** 是否以半透明预览样式显示。 */
  preview?: boolean
}
