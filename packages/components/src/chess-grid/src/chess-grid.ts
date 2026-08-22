import type { GoSign } from '../../types';

/** 棋盘网格组件的输入属性。 */
export interface ChessGridProps {
  /** 按行保存的棋子标记。 */
  rows: GoSign[][]
}

/** 棋盘网格默认作用域插槽接收的数据。 */
export interface ChessGridSlotProps {
  /** 当前网格单元的棋子标记。 */
  sign: GoSign
  /** 当前网格单元对应的棋盘坐标。 */
  position: string
}
