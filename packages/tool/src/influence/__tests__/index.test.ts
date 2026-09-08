import type { GoLayout } from '../../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getInfluenceLayout } from '../index';

const { getProbabilityMapMock } = vi.hoisted(() => ({ getProbabilityMapMock: vi.fn() }));

vi.mock('@sabaki/deadstones', () => ({
  getProbabilityMap: getProbabilityMapMock,
  useFetch: vi.fn(),
}));

describe('getInfluenceLayout', () => {
  beforeEach(() => {
    getProbabilityMapMock.mockReset();
  });

  it('maps probability to influence with a 0.15 absolute threshold', async () => {
    const layout: GoLayout = [
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, 1],
    ];
    getProbabilityMapMock.mockResolvedValue([
      [0.15, 0.1501, -0.1501],
      [0.2, -0.15, -0.2],
      [0, 0.8, 0.1],
    ]);

    const result = await getInfluenceLayout(layout, { iterations: 300 });

    expect(getProbabilityMapMock).toHaveBeenCalledWith(layout, 300);
    expect(result).toEqual([
      [0, 1, -1],
      [1, 0, -1],
      [0, 1, 0],
    ]);
  });

  it('uses the calculated influence for occupied positions', async () => {
    const layout: GoLayout = [[-1]];
    getProbabilityMapMock.mockResolvedValue([[0.5]]);

    const result = await getInfluenceLayout(layout);

    expect(result).toEqual([[1]]);
    expect(layout).toEqual([[-1]]);
  });

  it('returns a layout with the same shape and normalizes invalid probabilities to zero', async () => {
    const layout: GoLayout = [
      [1, 0],
      [0, -1],
    ];
    getProbabilityMapMock.mockResolvedValue([[Number.NaN], [Number.POSITIVE_INFINITY]]);

    const result = await getInfluenceLayout(layout);

    expect(result).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it('does not calculate an empty layout', async () => {
    const result = await getInfluenceLayout([]);

    expect(result).toEqual([]);
    expect(getProbabilityMapMock).not.toHaveBeenCalled();
  });
});
