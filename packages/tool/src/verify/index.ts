import type { GoLayout, GoVertex } from '../types';

/** 校验棋盘布局的尺寸和棋子标记是否符合约定。 */
export function isValidLayout(layout: GoLayout | undefined, size: number) {
  if (!Array.isArray(layout) || layout.length !== size) { return false; }
  if (layout.some(row => !Array.isArray(row) || row.length !== size)) { return false; }
  return layout.every(row => row.every(sign => sign === -1 || sign === 0 || sign === 1));
}

/** 棋子是否相等。 */
export function vertexEquals(first: GoVertex, second: GoVertex): boolean {
  return first[0] === second[0] && first[1] === second[1];
}
