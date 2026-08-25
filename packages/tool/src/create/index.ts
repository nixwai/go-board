import type { GoLayout, GoSign } from '../types';
import GoBoardData from '@sabaki/go-board';

/** 深拷贝棋盘布局，避免调用方直接修改内部行数据。 */
export function cloneLayout(signMap: GoLayout): GoLayout {
  return signMap.map(row => [...row]);
}

/** 创建指定尺寸的空棋盘布局。 */
export function createLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as GoSign));
}

/** 使用布局创建围棋规则引擎实例，并隔离传入布局。 */
export function createBoardData(signMap: GoLayout) {
  return new GoBoardData(cloneLayout(signMap));
}
