import type { Sign, SignMap, Vertex } from '@sabaki/go-board';

/** 棋盘上的棋子标记，1 表示黑子，-1 表示白子，0 表示空位。 */
export type GoSign = Sign;
/** 围棋棋盘的二维布局数据。 */
export type GoLayout = SignMap;
/** 围棋棋盘的坐标。 */
export type GoVertex = Vertex;
/** 支持文本坐标或规则引擎顶点的落子位置。 */
export type GoGamePosition = string | GoVertex;
/** 可落子的棋子标记，不包含空位标记 0。 */
export type PlayerSign = Exclude<GoSign, 0>;
/** 围棋对局初始化和重置配置。 */
export interface GoGameOptions {
  /** 棋盘尺寸。 */
  size?: number | string
  /** 初始棋盘布局。 */
  layout?: GoLayout
  /** 初始执棋方。 */
  player?: number
}
