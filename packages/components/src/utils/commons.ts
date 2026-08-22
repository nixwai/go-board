import type { Sign, SignMap } from '@sabaki/go-board';
import GoBoardData from '@sabaki/go-board';

/** 深拷贝棋盘布局，避免调用方直接修改内部行数据。 */
export function cloneSignMap(signMap: SignMap): SignMap {
  return signMap.map(row => [...row]);
}

/** 创建指定尺寸的空棋盘布局。 */
export function createSignMap(size: number): SignMap {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as Sign));
}

/** 使用布局创建围棋规则引擎实例，并隔离传入布局。 */
export function createBoardData(signMap: SignMap) {
  return new GoBoardData(cloneSignMap(signMap));
}

/** 校验棋盘布局的尺寸和棋子标记是否符合约定。 */
export function isValidSignMap(signMap: SignMap | undefined, size: number) {
  if (!Array.isArray(signMap) || signMap.length !== size) { return false; }
  if (signMap.some(row => !Array.isArray(row) || row.length !== size)) { return false; }
  return signMap.every(row => row.every(sign => sign === -1 || sign === 0 || sign === 1));
}
