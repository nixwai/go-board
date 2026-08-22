import type { Sign, SignMap } from '@sabaki/go-board';

/** 棋盘上的棋子标记，1 表示黑子，-1 表示白子，0 表示空位。 */
export type GoSign = Sign;
/** 围棋棋盘的二维布局数据。 */
export type GoLayout = SignMap;
