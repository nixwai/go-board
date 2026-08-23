import type { GoLayout } from '../types';

/** 校验棋盘布局的尺寸和棋子标记是否符合约定。 */
export function isValidLayout(signMap: GoLayout | undefined, size: number) {
  if (!Array.isArray(signMap) || signMap.length !== size) { return false; }
  if (signMap.some(row => !Array.isArray(row) || row.length !== size)) { return false; }
  return signMap.every(row => row.every(sign => sign === -1 || sign === 0 || sign === 1));
}
