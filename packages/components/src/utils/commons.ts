import type { Sign, SignMap } from '@sabaki/go-board';
import GoBoardData from '@sabaki/go-board';

const DEFAULT_SIZE = 19;
const MIN_SIZE = 1;
const MAX_SIZE = 25;

export function cloneSignMap(signMap: SignMap): SignMap {
  return signMap.map(row => [...row]);
}

export function createSignMap(size: number): SignMap {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as Sign));
}

export function createBoardData(signMap: SignMap) {
  return new GoBoardData(cloneSignMap(signMap));
}

export function normalizeNextPlayer(value: Sign | undefined) {
  return value === -1 ? -1 : 1;
}

export function normalizeSize(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) { return DEFAULT_SIZE; }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(parsed)));
}
