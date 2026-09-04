import type { GoLayout } from '../types';
import influence from '@sabaki/influence';

/** @sabaki/influence 的默认辐射半径要求最短边至少为 6。 */
const MIN_INFLUENCE_BOARD_SIZE = 6;

/** 将第三方结果收敛为工具包统一的棋子标记。 */
function normalizeInfluenceLayout(layout: number[][]): GoLayout {
  return layout.map(row => row.map(sign => sign === 1 ? 1 : sign === -1 ? -1 : 0));
}

/** 根据当前棋盘布局计算黑白双方的离散势力归属。 */
export function getInfluenceLayout(layout: GoLayout): GoLayout {
  const source = layout.map(row => [...row]);
  const width = source[0]?.length ?? 0;

  if (source.length === 0 || width === 0) {
    return source;
  }

  // 上游默认辐射半径在小棋盘上会越界，使用区域判断保证 1～5 路棋盘也能稳定返回结果。
  const result = Math.min(source.length, width) < MIN_INFLUENCE_BOARD_SIZE
    ? influence.areaMap(source)
    : influence.map(source, { discrete: true });

  return normalizeInfluenceLayout(result);
}
