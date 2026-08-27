/** 控制落子时是否阻止自杀、占用覆盖和打劫。 */
export interface GoMoveOptions {
  /** 是否阻止没有气且未提子的自杀落子。 */
  preventSuicide?: boolean
  /** 是否阻止在已有棋子的顶点上落子。 */
  preventOverwrite?: boolean
  /** 是否阻止立即回提形成的打劫落子。 */
  preventKo?: boolean
}

/** 描述一次落子尝试是否通过围棋基本规则校验。 */
export interface GoMoveAnalysis {
  /** 是否为无效顶点或停着。 */
  pass: boolean
  /** 落点是否已有棋子。 */
  overwrite: boolean
  /** 落子是否会提掉至少一个对方棋块。 */
  capturing: boolean
  /** 落子后己方棋块是否没有气。 */
  suicide: boolean
  /** 落点是否受到当前局面的打劫限制。 */
  ko: boolean
}
