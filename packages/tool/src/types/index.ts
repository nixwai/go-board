/** 棋盘上的棋子标记：1 表示黑子，-1 表示白子，0 表示空位。 */
export type GoSign = -1 | 0 | 1;
/** 围棋棋盘的二维布局数据。 */
export type GoLayout = GoSign[][];
/** 围棋棋盘的坐标。 */
export type GoVertex = [number, number];
/** 支持文本坐标或规则引擎顶点的落子位置。 */
export type GoGamePosition = string | GoVertex;
/** 可落子的棋子标记，不包含空位标记 0。 */
export type PlayerSign = Exclude<GoSign, 0>;

/** 规则引擎输出的完整对局快照。 */
export interface GoGameSnapshot {
  /** 棋盘尺寸。 */
  size: number | string
  /** 初始棋盘布局。 */
  layout: GoLayout
  /** 初始执棋方。 */
  player: PlayerSign
  /** 初始化劫子信息。 */
  ko: KoInfo
  /** 最新一手棋子的棋盘坐标。 */
  latestVertex?: GoVertex
}

/** 围棋对局初始化和重置配置。 */
export type GoGameOptions = Partial<GoGameSnapshot>;

/** 劫子信息 */
export interface KoInfo {
  /** 劫子发生的棋子标记。 */
  sign: GoSign
  /** 劫子发生时的顶点。 */
  vertex: GoVertex
}
