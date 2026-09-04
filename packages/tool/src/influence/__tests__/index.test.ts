import { describe, expect, it } from 'vitest';
import { getInfluenceLayout } from '../index';

describe('getInfluenceLayout', () => {
  it('returns a discrete influence layout without mutating the source layout', () => {
    const layout = [
      [1, 0, 0, 0, -1],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [-1, 0, 0, 0, 1],
    ] as const;
    const source = layout.map(row => [...row]);

    const result = getInfluenceLayout(source);

    expect(result).toHaveLength(5);
    expect(result.every(row => row.length === 5)).toBe(true);
    expect(result.flat().every(sign => sign === -1 || sign === 0 || sign === 1)).toBe(true);
    expect(source).toEqual(layout);
  });

  it('preserves the black and white influence sources', () => {
    const result = getInfluenceLayout([
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, -1],
    ]);

    expect(result[0]?.[0]).toBe(1);
    expect(result[2]?.[2]).toBe(-1);
  });

  it('calculates black and white influence on supported board sizes', () => {
    const layout = Array.from({ length: 9 }, (_, y) =>
      Array.from({ length: 9 }, (_, x) => x === 0 && y === 0 ? 1 : x === 8 && y === 8 ? -1 : 0));

    const result = getInfluenceLayout(layout);

    expect(result[0]?.[0]).toBe(1);
    expect(result[8]?.[8]).toBe(-1);
    expect(result[4]?.[4]).toBe(0);
  });
});
