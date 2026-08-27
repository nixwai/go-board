import { describe, expect, it } from 'vitest';
import { GoBoardData } from '../index';

describe('goBoardData', () => {
  it('clones the initial layout and exposes board dimensions', () => {
    const layout = [
      [1, 0, -1],
      [0, 1, 0],
    ] as const;
    const rule = new GoBoardData(layout.map(row => [...row]));

    expect(rule.width).toBe(3);
    expect(rule.height).toBe(2);
    expect(rule.layout).toEqual(layout);
    expect(rule.layout).not.toBe(layout);
    expect(rule.layout[0]).not.toBe(layout[0]);

    const source = [[1, 0], [0, -1]] as const;
    const isolated = new GoBoardData(source.map(row => [...row]));
    isolated.layout[0]![0] = 0;
    expect(isolated.get([0, 0])).toBe(1);
  });

  it('finds neighboring stones, chains, and distinct liberties', () => {
    const rule = new GoBoardData([
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 0],
      [0, 0, 0, 0],
    ]);

    expect(rule.getNeighbors([1, 1])).toEqual([[0, 1], [2, 1], [1, 0], [1, 2]]);
    expect(rule.getChain([1, 1])).toEqual([[1, 1], [2, 1], [1, 2]]);
    expect(rule.getLiberties([1, 1])).toEqual([
      [0, 1],
      [1, 0],
      [3, 1],
      [2, 0],
      [2, 2],
      [0, 2],
      [1, 3],
    ]);
    expect(rule.hasLiberties([1, 1])).toBe(true);
    expect(rule.getLiberties([0, 0])).toEqual([]);
  });

  it('makes immutable moves, removes captured chains, and counts captures', () => {
    const rule = new GoBoardData([
      [0, 1, 0],
      [1, -1, 1],
      [0, 1, 0],
    ]);

    const next = rule.makeMove(1, [2, 2], { preventOverwrite: true, preventSuicide: true });

    expect(rule.get([2, 2])).toBe(0);
    expect(next.get([2, 2])).toBe(1);
    expect(next.get([1, 1])).toBe(-1);
    expect(next.getCaptures(1)).toBe(0);

    const capture = new GoBoardData([
      [1, -1, 0],
      [0, 1, 0],
      [0, 0, 0],
    ]).makeMove(1, [2, 0]);

    expect(capture.get([1, 0])).toBe(0);
    expect(capture.getCaptures(1)).toBe(1);

    const doubleCapture = new GoBoardData([
      [1, -1, 1],
      [-1, 0, 1],
      [1, 1, 0],
    ]).makeMove(1, [1, 1], { preventSuicide: true });

    expect(doubleCapture.get([1, 0])).toBe(0);
    expect(doubleCapture.get([0, 1])).toBe(0);
    expect(doubleCapture.getCaptures(1)).toBe(2);
  });

  it('detects suicide and ko without mutating the board', () => {
    const suicide = new GoBoardData([
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ]);

    expect(suicide.analyzeMove(-1, [1, 1])).toEqual({
      pass: false,
      overwrite: false,
      capturing: false,
      suicide: true,
      ko: false,
    });
    expect(suicide.get([1, 1])).toBe(0);
    expect(() => suicide.makeMove(-1, [1, 1], { preventSuicide: true })).toThrow('Suicide prevented');

    const ko = new GoBoardData([
      [0, 1, -1, 0, 0],
      [1, 0, 1, -1, 0],
      [0, 1, -1, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]).makeMove(-1, [1, 1]);

    expect(ko.analyzeMove(1, [2, 1]).ko).toBe(true);
    expect(() => ko.makeMove(1, [2, 1], { preventKo: true })).toThrow('Ko prevented');
  });

  it('validates live chains', () => {
    const rule = new GoBoardData([
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, 0],
    ]);

    expect(rule.isValid()).toBe(true);
    expect(new GoBoardData([
      [1, -1],
      [-1, 1],
    ]).isValid()).toBe(false);
  });
});
