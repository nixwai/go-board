import type { GoGameOptions } from '@go-board/tool';

import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { emptyLayout, exposed, lastEmittedArgument, mountSavedBoard } from './go-board-test-helpers';

describe('goBoard save integration', () => {
  it('uses the current archive snapshot instead of init during rebuild', async () => {
    const initLayout = emptyLayout(3);
    initLayout[0][0] = 1;
    const archivedLayout = emptyLayout(3);
    archivedLayout[1][1] = -1;
    const { boardWrapper, saveWrapper } = mountSavedBoard(
      { size: 3, layout: initLayout, player: -1 },
      [{ size: 3, layout: archivedLayout, player: 1, latestVertex: [1, 1] }],
    );

    await nextTick();
    expect(boardWrapper.find('[aria-label="B2"] .chess-piece-stone-white').exists()).toBe(true);
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone').exists()).toBe(false);
    expect(saveWrapper.emitted('update:value')).toBeUndefined();
  });

  it('rejects invalid archive snapshots without clearing history', async () => {
    const initLayout = emptyLayout(3);
    initLayout[0][0] = 1;
    const invalid = { size: 3, layout: [[1, 0]], player: 1 } as GoGameOptions;
    const { boardWrapper, saveWrapper } = mountSavedBoard(
      { size: 3, layout: initLayout, player: -1 },
      [invalid],
    );

    await nextTick();
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone-black').exists()).toBe(true);
    expect(boardWrapper.find('[aria-label="B2"] .chess-piece-stone').exists()).toBe(false);
    expect(saveWrapper.emitted('update:value')).toBeUndefined();
  });

  it('archives init when rebuild has no snapshot', async () => {
    const initLayout = emptyLayout(3);
    initLayout[0][0] = 1;
    const { boardWrapper, saveWrapper } = mountSavedBoard({
      size: 3,
      layout: initLayout,
      player: -1,
      latestVertex: [0, 0],
    });

    await nextTick();
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone-black').exists()).toBe(true);
    expect(lastEmittedArgument(saveWrapper, 'update:value')).toEqual([
      expect.objectContaining({
        size: 3,
        layout: initLayout,
        player: -1,
        latestVertex: [0, 0],
      }),
    ]);
  });

  it('archives the fallback board when init is invalid', async () => {
    const { boardWrapper, saveWrapper } = mountSavedBoard({
      size: 3,
      layout: [[1, 0]],
      player: -1,
    });

    expect(boardWrapper.findAll('.chess-piece-stone')).toHaveLength(0);
    await nextTick();
    expect(lastEmittedArgument(saveWrapper, 'update:value')).toEqual([
      expect.objectContaining({
        size: 3,
        layout: emptyLayout(3),
        player: 1,
      }),
    ]);
  });

  it('archives only successful stone moves from emitMove', async () => {
    const { boardWrapper, saveWrapper } = mountSavedBoard({ size: 3 });
    const api = exposed(boardWrapper);

    await nextTick();
    expect(saveWrapper.emitted('update:value')).toHaveLength(1);
    expect(api.play()).toBe(true);
    expect(saveWrapper.emitted('update:value')).toHaveLength(1);
    expect(api.play('A1')).toBe(true);
    expect(saveWrapper.emitted('update:value')).toHaveLength(2);
    expect(api.play('A1')).toBe(false);
    expect(saveWrapper.emitted('update:value')).toHaveLength(2);
  });

  it('restores and re-archives the cached board when the archive is cleared', async () => {
    const { boardWrapper, saveApi, saveWrapper } = mountSavedBoard({ size: 3 });
    const api = exposed(boardWrapper);

    expect(api.play('A1')).toBe(true);
    await nextTick();
    expect(boardWrapper.find('[aria-label="A1"] .chess-piece-stone-black').exists()).toBe(true);
    saveApi.clear();
    await nextTick();

    expect(boardWrapper.find('[aria-label="A1"] .chess-piece-stone').exists()).toBe(false);
    expect(boardWrapper.findAll('.chess-piece-stone')).toHaveLength(0);
    expect(boardWrapper.emitted('update')).toHaveLength(3);
    expect(lastEmittedArgument(saveWrapper, 'update:value')).toEqual([
      expect.objectContaining({
        size: 3,
        layout: emptyLayout(3),
        player: 1,
      }),
    ]);
  });

  it('clears old archives and keeps only the reset snapshot', async () => {
    const { boardWrapper, saveWrapper } = mountSavedBoard({ size: 3 });
    const api = exposed(boardWrapper);
    const resetLayout = emptyLayout(3);
    resetLayout[2][2] = -1;

    await nextTick();
    expect(api.play('A1')).toBe(true);
    expect(api.reset({ size: 3, layout: resetLayout, player: 1, latestVertex: [2, 2] })).toBe(true);
    expect(saveWrapper.emitted('update:value')).toHaveLength(3);

    expect(lastEmittedArgument(saveWrapper, 'update:value')).toEqual([
      expect.objectContaining({
        size: 3,
        layout: resetLayout,
        player: 1,
        latestVertex: [2, 2],
      }),
    ]);
  });

  it('synchronizes externally changed snapshots without re-saving them', async () => {
    const { boardWrapper, saveApi, saveWrapper } = mountSavedBoard({ size: 3 });

    await nextTick();
    const initialSaveCount = saveWrapper.emitted('update:value')?.length ?? 0;
    const savedLayout = emptyLayout(3);
    savedLayout[0][0] = 1;
    const saved = {
      size: 3,
      layout: savedLayout,
      player: -1,
      latestVertex: [0, 0],
    } as GoGameOptions;

    expect(saveApi.save(saved)).toBe(true);
    await nextTick();
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone-black').exists()).toBe(true);
    expect(saveWrapper.emitted('update:value')).toHaveLength(initialSaveCount + 1);

    const resetLayout = emptyLayout(3);
    resetLayout[2][2] = -1;
    const reset = {
      size: 3,
      layout: resetLayout,
      player: 1,
      latestVertex: [2, 2],
    } as GoGameOptions;

    expect(saveApi.reset(reset)).toBe(true);
    await nextTick();
    expect(boardWrapper.find('[aria-label="C1"] .chess-piece-stone-white').exists()).toBe(true);
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone').exists()).toBe(false);
    expect(saveWrapper.emitted('update:value')).toHaveLength(initialSaveCount + 2);
  });
  it('synchronizes archive navigation without creating snapshots', async () => {
    const firstLayout = emptyLayout(3);
    firstLayout[0][0] = 1;
    const secondLayout = emptyLayout(3);
    secondLayout[1][1] = -1;
    const first = { size: 3, layout: firstLayout, player: -1 } as GoGameOptions;
    const second = { size: 3, layout: secondLayout, player: 1 } as GoGameOptions;
    const { boardWrapper, saveApi, saveWrapper } = mountSavedBoard({ size: 3 }, [first, second]);

    expect(saveApi.load(0)).toBe(first);
    await nextTick();
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone-black').exists()).toBe(true);
    expect(saveApi.forward()).toBe(second);
    await nextTick();
    expect(boardWrapper.find('[aria-label="B2"] .chess-piece-stone-white').exists()).toBe(true);
    expect(saveWrapper.emitted('update:value')?.map(event => event[0])).toEqual([
      [first, second],
      [first, second],
    ]);
  });

  it('keeps the initialized archive snapshot cached while navigating history', async () => {
    const firstLayout = emptyLayout(3);
    firstLayout[0][0] = 1;
    const secondLayout = emptyLayout(3);
    secondLayout[1][1] = -1;
    const first = { size: 3, layout: firstLayout, player: -1 } as GoGameOptions;
    const second = { size: 3, layout: secondLayout, player: 1 } as GoGameOptions;
    const { boardWrapper, saveApi } = mountSavedBoard({ size: 3 }, [first, second]);
    const api = exposed(boardWrapper);

    expect(saveApi.load(0)).toBe(first);
    await nextTick();
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone-black').exists()).toBe(true);

    expect(api.reset()).toBe(true);
    await nextTick();
    expect(boardWrapper.find('[aria-label="B2"] .chess-piece-stone-white').exists()).toBe(true);
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone').exists()).toBe(false);
  });
  it('rebuilds from the cached reset snapshot when the archive is empty', async () => {
    const cachedLayout = emptyLayout(3);
    cachedLayout[2][2] = -1;
    const { boardWrapper, saveApi, saveWrapper } = mountSavedBoard({ size: 3 });
    const api = exposed(boardWrapper);

    expect(api.reset({ size: 3, layout: cachedLayout, player: 1 })).toBe(true);
    saveApi.clear();
    await saveWrapper.setProps({ value: [] });
    await nextTick();

    expect(boardWrapper.find('[aria-label="C1"] .chess-piece-stone-white').exists()).toBe(true);
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone').exists()).toBe(false);
    expect(lastEmittedArgument(saveWrapper, 'update:value')).toEqual([
      expect.objectContaining({ layout: cachedLayout, player: 1 }),
    ]);
  });

  it('rebuilds from the cached archive snapshot after the controlled archive is emptied', async () => {
    const initLayout = emptyLayout(3);
    initLayout[0][0] = 1;
    const archivedLayout = emptyLayout(3);
    archivedLayout[1][1] = -1;
    const archived = { size: 3, layout: archivedLayout, player: 1 } as GoGameOptions;
    const { boardWrapper, saveWrapper } = mountSavedBoard(
      { size: 3, layout: initLayout, player: -1 },
      [archived],
    );

    await saveWrapper.setProps({ value: [] });
    await nextTick();

    expect(boardWrapper.find('[aria-label="B2"] .chess-piece-stone-white').exists()).toBe(true);
    expect(boardWrapper.find('[aria-label="A3"] .chess-piece-stone').exists()).toBe(false);
    expect(lastEmittedArgument(saveWrapper, 'update:value')).toEqual([
      expect.objectContaining({ layout: archivedLayout, player: 1 }),
    ]);
  });
});
