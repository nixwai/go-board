import { describe, expect, it } from 'vitest';
import { normalizePosition, normalizeVertex } from '../index';

describe('normalizePosition', () => {
  it('normalizes text and vertex coordinates to text coordinates', () => {
    expect(normalizePosition(' d4 ', 9)).toBe('D4');
    expect(normalizePosition([1, 2], 3)).toBe('B1');
    expect(normalizePosition([8, 2], 9)).toBe('J7');
  });

  it('returns null for an invalid coordinate', () => {
    expect(normalizePosition('I4', 9)).toBeNull();
    expect(normalizePosition('A0', 9)).toBeNull();
    expect(normalizePosition([0, 3], 3)).toBeNull();
    expect(normalizePosition([25, 0], 26)).toBeNull();
  });
});

describe('normalizeVertex', () => {
  it('converts a Go coordinate to a zero-based vertex', () => {
    expect(normalizeVertex(' a3 ', 3)).toEqual([0, 0]);
    expect(normalizeVertex('C1', 3)).toEqual([2, 2]);
    expect(normalizeVertex('E1', 3)).toEqual([4, 2]);
  });

  it('returns null for an invalid coordinate', () => {
    expect(normalizeVertex('I1', 3)).toBeNull();
    expect(normalizeVertex('A0', 3)).toBeNull();
    expect(normalizeVertex('pass', 3)).toBeNull();
  });

  it('keeps vertex input unchanged and leaves board bounds to the caller', () => {
    const vertex = [1, 2] as [number, number];

    expect(normalizeVertex(vertex, 3)).toBe(vertex);
    expect(normalizeVertex('A4', 3)).toEqual([0, -1]);
  });
});
