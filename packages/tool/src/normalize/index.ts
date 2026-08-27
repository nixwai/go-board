import type { GoGamePosition, GoVertex, PlayerSign } from '../types';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../constants';

const ALPHA = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

/** 将执棋方归一化为黑方或白方，非法值默认使用黑方。 */
export function normalizePlayer(value?: number): PlayerSign {
  return value === -1 ? -1 : 1;
}

/** 将棋盘尺寸归一化到支持范围内的整数。 */
export function normalizeSize(value?: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SIZE;
  }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(parsed)));
}

/** 将文本或顶点坐标统一转换为文本棋盘坐标。 */
export function normalizePosition(position: GoGamePosition, len: number): string | null {
  const normalized = typeof position === 'string'
    ? position.trim().toUpperCase()
    : `${ALPHA[position[0]] ?? ''}${len - position[1]}`;
  const match = /^([A-HJ-Z]+)(\d+)$/.exec(normalized);
  if (!match) {
    return null;
  }

  const row = Number(match[2]);
  if (!Number.isInteger(row) || row < 1) {
    return null;
  }
  return `${match[1]}${row}`;
}

/** 将文本棋盘坐标转换为规则引擎顶点；棋盘边界由调用方校验。 */
export function normalizeVertex(position: GoGamePosition, len: number): GoVertex | null {
  if (typeof position !== 'string') {
    return position;
  }

  const normalized = normalizePosition(position, len);
  if (!normalized) {
    return null;
  }

  const x = ALPHA.indexOf(normalized[0]!);
  const y = len - Number(normalized.slice(1));
  return [x, y];
}
