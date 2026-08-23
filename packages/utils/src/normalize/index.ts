import type { GoSign } from '../types';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../constants';

/** 将执棋方归一化为黑方或白方，非法值默认使用黑方。 */
export function normalizePlayer(value: GoSign | undefined) {
  return value === -1 ? -1 : 1;
}

/** 将棋盘尺寸归一化到支持范围内的整数。 */
export function normalizeSize(value?: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) { return DEFAULT_SIZE; }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(parsed)));
}

/** 规范化棋盘坐标，并过滤不符合格式的输入。 */
export function normalizePosition(position: string): string | null {
  const normalized = position.trim().toUpperCase();
  const match = /^([A-HJ-Z]+)(\d+)$/.exec(normalized);
  if (!match) { return null; }

  const row = Number(match[2]);
  if (!Number.isInteger(row) || row < 1) { return null; }
  return `${match[1]}${row}`;
}
