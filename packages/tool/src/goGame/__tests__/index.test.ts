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

  it('converts Go coordinates inside the game input boundary', () => {
    const game = new GoGame({ size: 3 });

    expect(game.play('a3')).toBe(true);
    expect(game.getSign('A3')).toBe(1);

    game.rotate();
    expect(game.play('C1')).toBe(true);
    expect(game.getSign('C1')).toBe(-1);
    expect(game.isLegal('A0')).toBe(false);
    expect(game.getSign('I1')).toBeUndefined();
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

  it('rejects immediate ko recapture and allows recapture after an intervening move', () => {
    const game = new GoGame({
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
