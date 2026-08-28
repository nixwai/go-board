import type { GoLayout, GoSign, GoVertex } from '../types';
/** 深拷贝棋盘布局，避免调用方直接修改内部行数据。 */
export function cloneLayout(layout: GoLayout): GoLayout {
  return layout.map(row => [...row]);
}

/** 复制顶点坐标，避免调用方共享可变数组引用。 */
export function cloneVertex(vertex?: GoVertex): GoVertex | undefined {
  return vertex ? [vertex[0], vertex[1]] : undefined;
}

/** 创建指定尺寸的空棋盘布局。 */
export function createLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as GoSign));
}
