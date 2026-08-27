import { describe, expect, it } from 'vitest';
import { normalizeVertex } from '../index';

describe('normalizeVertex', () => {
  it('converts a Go coordinate to a zero-based vertex', () => {
    expect(normalizeVertex(' a3 ', [3, 3])).toEqual([0, 0]);
    expect(normalizeVertex('C1', [3, 3])).toEqual([2, 2]);
    expect(normalizeVertex('E1', [5, 3])).toEqual([4, 2]);
  });

  it('returns null for an invalid coordinate', () => {
    expect(normalizeVertex('I1', [3, 3])).toBeNull();
    expect(normalizeVertex('A0', [3, 3])).toBeNull();
    expect(normalizeVertex('pass', [3, 3])).toBeNull();
  });

  it('keeps vertex input unchanged and leaves board bounds to the caller', () => {
    const vertex = [1, 2] as [number, number];

    expect(normalizeVertex(vertex, [3, 3])).toBe(vertex);
    expect(normalizeVertex('A4', [3, 3])).toEqual([0, -1]);
  });
});
