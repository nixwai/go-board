import type { Sign, SignMap } from '@sabaki/go-board';
import GoBoardData from '@sabaki/go-board';

export function cloneSignMap(signMap: SignMap): SignMap {
  return signMap.map(row => [...row]);
}

export function createSignMap(size: number): SignMap {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0 as Sign));
}

export function createBoardData(signMap: SignMap) {
  return new GoBoardData(cloneSignMap(signMap));
}

export function isValidSignMap(signMap: SignMap | undefined, size: number) {
  if (!Array.isArray(signMap) || signMap.length !== size) { return false; }
  if (signMap.some(row => !Array.isArray(row) || row.length !== size)) { return false; }
  return signMap.every(row => row.every(sign => sign === -1 || sign === 0 || sign === 1));
}
