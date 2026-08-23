/** 棋盘容器组件的输入属性。 */
export interface ChessboardProps {
  /** 棋盘边长，用于保持正方形布局。 */
  size: number | string
  /** 棋盘容器宽度，支持数字像素值或 CSS 宽度字符串。 */
  width?: number | string
}
