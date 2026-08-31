import type { GoGameOptions } from '../../types';
import { describe, expect, it } from 'vitest';
import { GoHistoryData } from '../index';

function createSnapshot(player: 1 | -1, size = 3): GoGameOptions {
  return {
    size,
    player,
    layout: [
      [player, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    ko: { sign: player, vertex: [1, 1] },
  };
}

describe('goHistoryData', () => {
  it('initializes at the given position and exposes mutable snapshots', () => {
    const first = createSnapshot(1);
    const second = createSnapshot(-1);
    const snapshots = [first, second];
    const history = new GoHistoryData(snapshots, 1);

    expect(history.length).toBe(2);
    expect(history.current).toBe(1);
    expect(history.snapshot).toBe(second);
    expect(history.snapshots).not.toBe(snapshots);
    expect(snapshots).toHaveLength(2);

    second.layout![0]![0] = 0;
    second.ko!.vertex[0] = 0;

    expect(history.snapshot).toBe(second);
    expect(history.snapshot?.layout?.[0]?.[0]).toBe(0);
    expect(history.snapshot?.ko?.vertex[0]).toBe(0);
  });

  it('defaults the current position to the last snapshot', () => {
    const snapshots = [createSnapshot(1), createSnapshot(-1), createSnapshot(1)];
    const history = new GoHistoryData(snapshots);

    expect(history.current).toBe(2);
    expect(history.snapshot).toBe(snapshots[2]);
  });

  it('navigates backward, forward, and jumps to an absolute position', () => {
    const snapshots = [createSnapshot(1), createSnapshot(-1), createSnapshot(1)];
    const history = new GoHistoryData(snapshots, 1);

    expect(history.backward()).toBe(snapshots[0]);
    expect(history.current).toBe(0);
    expect(history.forward(2)).toBe(snapshots[2]);
    expect(history.current).toBe(2);
    expect(history.jump(1)).toBe(snapshots[1]);
    expect(history.current).toBe(1);
  });

  it('keeps the current position when navigation goes out of bounds', () => {
    const history = new GoHistoryData([createSnapshot(1), createSnapshot(-1)], 0);

    expect(history.backward()).toBeUndefined();
    expect(history.current).toBe(0);
    expect(history.forward(2)).toBeUndefined();
    expect(history.current).toBe(0);
    expect(history.jump(2)).toBeUndefined();
    expect(history.current).toBe(0);
    expect(history.forward(0)).toBeUndefined();
  });

  it('inserts the same snapshot and discards following snapshots', () => {
    const first = createSnapshot(1);
    const second = createSnapshot(-1);
    const inserted = createSnapshot(1, 5);
    const history = new GoHistoryData([first, second], 0);

    expect(history.insert(inserted)).toBe(true);
    expect(history.current).toBe(1);
    expect(history.snapshot).toBe(inserted);
    expect(history.snapshots).toEqual([first, inserted]);
    expect(history.length).toBe(2);

    inserted.layout![0]![0] = -1;
    expect(history.snapshot).toBe(inserted);
    expect(history.snapshot?.layout?.[0]?.[0]).toBe(-1);
  });

  it('supports inserting at an explicit position and starts empty histories at the inserted snapshot', () => {
    const first = createSnapshot(1);
    const second = createSnapshot(-1);
    const history = new GoHistoryData([first, second], 1);

    expect(history.insert(createSnapshot(1, 7), 0)).toBe(true);
    expect(history.current).toBe(0);
    expect(history.snapshots[0]).toBe(history.snapshot);

    const emptyHistory = new GoHistoryData([], 0);
    expect(emptyHistory.snapshot).toBeUndefined();
    expect(emptyHistory.insert(first)).toBe(true);
    expect(emptyHistory.current).toBe(0);
    expect(emptyHistory.snapshot).toEqual(first);
  });

  it('clears all snapshots and resets the current position', () => {
    const snapshots = [createSnapshot(1), createSnapshot(-1)];
    const history = new GoHistoryData(snapshots, 1);

    expect(history.clear()).toBeUndefined();
    expect(history.snapshots).not.toBe(snapshots);
    expect(snapshots).toHaveLength(2);
    expect(history.snapshots).toEqual([]);
    expect(history.length).toBe(0);
    expect(history.current).toBe(-1);
    expect(history.snapshot).toBeUndefined();
  });
});
