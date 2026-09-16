/** 棋盘网格组件的输入属性。 */
export interface ChessGridProps {
  /** 按行保存的棋子标记。 */
  rows: (0 | 1 | -1)[][]
  /** 按行保存的棋子势力值，1 表示黑势力，-1 表示白势力，0 表示无势力。 */
  influences?: (0 | 1 | -1)[][]
  /** 是否禁用交互。 */
  disabled?: boolean
}

/** 棋盘网格单元的二维索引坐标。 */
export type ChessGridPosition = [number, number];

/** 棋盘网格默认作用域插槽接收的数据。 */
export interface ChessGridSlotProps {
  /** 当前网格单元的棋子标记。 */
  sign: 0 | 1 | -1
  /** 当前网格单元的势力值。 */
  influence: 0 | 1 | -1
  /** 当前网格单元对应的棋盘坐标。 */
  position: ChessGridPosition
}
