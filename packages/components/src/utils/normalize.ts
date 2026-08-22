import type { Sign } from '@sabaki/go-board';
import { DEFAULT_SIZE, MAX_SIZE, MIN_SIZE } from '../constants';

export function normalizePlayer(value: Sign | undefined) {
  return value === -1 ? -1 : 1;
}

export function normalizeSize(value?: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) { return DEFAULT_SIZE; }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(parsed)));
}

export function normalizePosition(position: string): string | null {
  const normalized = position.trim().toUpperCase();
  const match = /^([A-HJ-Z]+)(\d+)$/.exec(normalized);
  if (!match) { return null; }

  const row = Number(match[2]);
  if (!Number.isInteger(row) || row < 1) { return null; }
  return `${match[1]}${row}`;
}
