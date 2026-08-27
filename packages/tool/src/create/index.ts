import type { GoLayout, GoSign } from '../types';
/** 深拷贝棋盘布局，避免调用方直接修改内部行数据。 */
export function cloneLayout(layout: GoLayout): GoLayout {
  return layout.map(row => [...row]);
}

/** 创建指定尺寸的空棋盘布局。 */
export function createLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as GoSign));
}
