import { describe, expect, it } from 'vitest';
import { cloneVertex } from '../index';

describe('create', () => {
  it('clones a vertex without exposing the original array', () => {
    const vertex: [number, number] = [1, 2];
    const cloned = cloneVertex(vertex);

    expect(cloned).toEqual(vertex);
    expect(cloned).not.toBe(vertex);
  });

  it('keeps an empty vertex value empty', () => {
    expect(cloneVertex()).toBeUndefined();
  });
});
