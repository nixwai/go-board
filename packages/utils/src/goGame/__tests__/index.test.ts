import { describe, expect, it } from 'vitest';
import { GoGame } from '../index';

describe('goGame', () => {
  it('creates an empty board with normalized defaults', () => {
    const game = new GoGame({ size: '3.8', player: -1 });

    expect(game.size).toBe(3);
    expect(game.player).toBe(-1);
    expect(game.layout).toEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  it('plays legal moves and rejects invalid positions', () => {
    const game = new GoGame({ size: 3 });

    expect(game.play('a1')).toBe(true);
    expect(game.getSign('A1')).toBe(1);
    expect(game.play('A1')).toBe(false);
    expect(game.play('I1')).toBe(false);
    expect(game.play('D4')).toBe(false);
  });

  it('returns cloned layouts and restores the last valid reset', () => {
    const game = new GoGame({ size: 3 });
    const layout = game.layout;
    layout[0]![0] = -1;

    expect(game.getSign('A1')).toBe(0);
    expect(game.play('B2')).toBe(true);
    expect(game.reset()).toBe(true);
    expect(game.getSign('B2')).toBe(0);
  });

  it('captures stones and rejects suicide', () => {
    const captureGame = new GoGame({
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

    const suicideGame = new GoGame({
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
