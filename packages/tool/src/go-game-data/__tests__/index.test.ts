import { describe, expect, it } from 'vitest';
import { GoGameData } from '../index';

describe('goGameData', () => {
  it('creates an empty board with normalized defaults', () => {
    const game = new GoGameData({ size: '3.8', player: -1 });

    expect(game.size).toBe(3);
    expect(game.player).toBe(-1);
    expect(game.layout).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(game.snapshot.latestVertex).toBeUndefined();
    expect(game.ko).toBeUndefined();
    expect(game.snapshot.ko).toBeUndefined();
  });

  it('plays legal moves and rejects invalid positions', () => {
    const game = new GoGameData({ size: 3 });

    expect(game.hasStone('A1')).toBe(false);
    expect(game.play('a1')).toBe(true);
    expect(game.getSign('A1')).toBe(1);
    expect(game.hasStone('A1')).toBe(true);
    expect(game.hasStone([0, 2])).toBe(true);
    expect(game.hasStone('I1')).toBe(false);
    expect(game.hasStone([0.5, 0])).toBe(false);
    expect(game.snapshot.latestVertex).toEqual([0, 2]);

    const snapshot = game.snapshot;
    snapshot.latestVertex![0] = 2;
    expect(game.snapshot.latestVertex).toEqual([0, 2]);

    expect(game.play('A1')).toBe(false);
    expect(game.play('I1')).toBe(false);
    expect(game.play('D4')).toBe(false);
    expect(game.snapshot.latestVertex).toEqual([0, 2]);
  });

  it('converts Go coordinates inside the game input boundary', () => {
    const game = new GoGameData({ size: 3 });

    expect(game.play('a3')).toBe(true);
    expect(game.getSign('A3')).toBe(1);

    game.rotate();
    expect(game.play('C1')).toBe(true);
    expect(game.getSign('C1')).toBe(-1);
    expect(game.snapshot.latestVertex).toEqual([2, 2]);
    expect(game.isLegal('A0')).toBe(false);
    expect(game.getSign('I1')).toBeUndefined();
  });

  it('returns cloned layouts and restores the last valid reset', () => {
    const game = new GoGameData({ size: 3 });
    const layout = game.layout;
    layout[0]![0] = -1;

    expect(game.getSign('A1')).toBe(0);
    expect(game.play('B2')).toBe(true);
    expect(game.snapshot.latestVertex).toEqual([1, 1]);
    expect(game.reset()).toBe(true);
    expect(game.getSign('B2')).toBe(0);
    expect(game.snapshot.latestVertex).toBeUndefined();
  });

  it('updates transient state without replacing the cached reset snapshot', () => {
    const cachedLayout = [
      [1, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ] as const;
    const updatedLayout = [
      [0, 0, 0],
      [0, -1, 0],
      [0, 0, 0],
    ] as const;
    const game = new GoGameData({ size: 3, layout: cachedLayout.map(row => [...row]), player: -1 });

    expect(game.update({ size: 3, layout: updatedLayout.map(row => [...row]), player: 1 })).toBe(true);
    expect(game.layout).toEqual(updatedLayout);
    expect(game.player).toBe(1);

    expect(game.reset()).toBe(true);
    expect(game.layout).toEqual(cachedLayout);
    expect(game.player).toBe(-1);
  });

  it('rejects invalid resets without replacing the current or cached state', () => {
    const game = new GoGameData({ size: 3, player: -1 });

    expect(game.play('A1')).toBe(true);
    expect(game.reset({ size: 3, layout: [[1, 0]], player: 1 })).toBe(false);
    expect(game.getSign('A1')).toBe(-1);
    expect(game.player).toBe(-1);

    expect(game.reset()).toBe(true);
    expect(game.layout).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(game.player).toBe(-1);
  });
  it('restores the latest position from an explicit game snapshot', () => {
    const game = new GoGameData({
      size: 3,
      layout: [
        [0, 0, 0],
        [0, -1, 0],
        [1, 0, 0],
      ],
      player: 1,
      latestVertex: [1, 1],
    });

    expect(game.snapshot.latestVertex).toEqual([1, 1]);
    expect(game.play('C1')).toBe(true);
    expect(game.snapshot.latestVertex).toEqual([2, 2]);
    expect(game.reset({
      size: 3,
      layout: [
        [0, 0, 0],
        [0, -1, 0],
        [1, 0, 0],
      ],
      player: 1,
      latestVertex: [1, 1],
    })).toBe(true);
    expect(game.snapshot.latestVertex).toEqual([1, 1]);
  });

  it('clears a latest position that does not contain a stone', () => {
    const invalidGame = new GoGameData({
      size: 3,
      player: -1,
      latestVertex: [0, 0],
    });
    expect(invalidGame.player).toBe(-1);
    expect(invalidGame.snapshot.latestVertex).toBeUndefined();

    const game = new GoGameData({
      size: 3,
      layout: [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      latestVertex: [0, 0],
    });
    expect(game.snapshot.latestVertex).toEqual([0, 0]);

    expect(game.reset({
      size: 3,
      player: -1,
      layout: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
      latestVertex: [0.5, 0],
    })).toBe(true);
    expect(game.player).toBe(-1);
    expect(game.snapshot.latestVertex).toBeUndefined();
  });

  it('rejects immediate ko recapture and allows recapture after an intervening move', () => {
    const game = new GoGameData({
      size: 5,
      player: -1,
      layout: [
        [0, 1, -1, 0, 0],
        [1, 0, 1, -1, 0],
        [0, 1, -1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
    });

    expect(game.play('B4')).toBe(true);
    game.rotate();

    expect(game.isLegal('C4')).toBe(false);
    expect(game.play('C4')).toBe(false);
    expect(game.player).toBe(1);
    expect(game.getSign('B4')).toBe(-1);
    expect(game.getSign('C4')).toBe(0);

    expect(game.play('A1')).toBe(true);
    game.rotate();
    expect(game.isLegal('C4')).toBe(true);
    expect(game.play('C4')).toBe(true);
  });

  it('initializes, snapshots, and restores ko information', () => {
    const game = new GoGameData({
      size: 5,
      player: 1,
      layout: [
        [0, 1, -1, 0, 0],
        [1, -1, 0, -1, 0],
        [0, 1, -1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ],
      ko: { sign: 1, vertex: [2, 1] },
    });

    expect(game.isLegal('C4')).toBe(false);
    expect(game.ko).toEqual({ sign: 1, vertex: [2, 1] });
    expect(game.snapshot.ko).toEqual({ sign: 1, vertex: [2, 1] });

    expect(game.play('A1')).toBe(true);
    expect(game.reset()).toBe(true);
    expect(game.isLegal('C4')).toBe(false);
  });

  it('captures stones and rejects suicide', () => {
    const captureGame = new GoGameData({
      size: 3,
      player: 1,
      layout: [
        [1, -1, 0],
        [0, 1, 0],
        [0, 0, 0],
      ],
    });

    expect(captureGame.play('C3')).toBe(true);
    expect(captureGame.getSign('B1')).toBe(0);

    const suicideGame = new GoGameData({
      size: 3,
      player: -1,
      layout: [
        [0, 1, 0],
        [1, 0, 1],
        [0, 1, 0],
      ],
    });

    expect(suicideGame.play('B2')).toBe(false);
  });
});
