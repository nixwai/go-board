/** 棋盘网格组件的输入属性。 */
export interface ChessGridProps {
  /** 按行保存的棋子标记。 */
  rows: (0 | 1 | -1)[][]
  /** 是否禁用交互。 */
  disabled?: boolean
}

/** 棋盘网格默认作用域插槽接收的数据。 */
export interface ChessGridSlotProps {
  /** 当前网格单元的棋子标记。 */
  sign: 0 | 1 | -1
  /** 当前网格单元对应的棋盘坐标。 */
  position: string
}
