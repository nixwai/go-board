/** 棋子组件的输入属性。 */
export interface ChessPieceProps {
  /** 棋子颜色，1 表示黑子，-1 表示白子。 */
  sign: 1 | -1
  /** 是否以半透明预览样式显示。 */
  preview?: boolean
  /** 是否在棋子中心显示空心圆标记。 */
  marked?: boolean
}
