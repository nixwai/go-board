import type { GoGameOptions, GoLayout } from '@go-board/tool';

import type { GoSaveExposed } from '../../go-save/src/go-save';
import type { GoBoardExposed } from '../src/go-board';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h, nextTick } from 'vue';
import GoSave from '../../go-save/src/go-save.vue';
import GoBoard from '../src/go-board.vue';

function emptyLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array.from({ length: size }).fill(0)) as GoLayout;
}

function exposed(wrapper: ReturnType<typeof mount>): GoBoardExposed {
  return wrapper.vm as unknown as GoBoardExposed;
}

function mountSavedBoard(init: GoGameOptions, value?: GoGameOptions[]) {
  const saveWrapper = mount(GoSave, {
    props: { value },
    slots: { default: () => h(GoBoard, { init }) },
  });

  return {
    boardWrapper: saveWrapper.findComponent(GoBoard),
    saveApi: saveWrapper.vm as unknown as GoSaveExposed,
    saveWrapper,
  };
}

describe('goBoard', () => {
  it('forwards root aria and DOM attributes through chessboard', () => {
    const wrapper = mount(GoBoard, {
      attrs: {
        'aria-label': 'go board',
        'data-testid': 'go-board',
      },
    });

    expect(wrapper.find('.chessboard').attributes('aria-label')).toBe('go board');
    expect(wrapper.find('.chessboard').attributes('data-testid')).toBe('go-board');
  });

  it('renders a default 19 by 19 board', () => {
    const wrapper = mount(GoBoard);

    expect(wrapper.findAll('.chess-grid-cell')).toHaveLength(19 * 19);
    expect(wrapper.find('.chessboard').attributes('style')).toContain('width: 100%');
  });

  it('renders an initialized layout and uses the requested next sign', async () => {
    const init: GoGameOptions = {
      layout: [
        [1, 0, 0],
        [0, -1, 0],
        [0, 0, 0],
      ],
      player: -1,
    };
    const wrapper = mount(GoBoard, { props: { init: { ...init, size: 3 } } });

    expect(wrapper.findAll('.chess-piece-stone')).toHaveLength(2);
    expect(exposed(wrapper).play([2, 2])).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.chess-piece-stone-white')).toHaveLength(2);
  });

  it('falls back to an empty board for invalid initialization', async () => {
    const wrapper = mount(GoBoard, {
      props: {
        size: 3,
        init: { size: 3, layout: [[1, 0]], player: -1 },
      },
    });

    expect(wrapper.findAll('.chess-piece-stone')).toHaveLength(0);
    expect(exposed(wrapper).play('A1')).toBe(true);
    await nextTick();
    expect(wrapper.find('.chess-piece-stone-black').exists()).toBe(true);
  });

  it('plays moves, alternates signs, and emits update and move snapshots', async () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });

    expect(exposed(wrapper).play('a1')).toBe(true);
    await nextTick();
    expect(wrapper.find('.chess-piece-stone-black').exists()).toBe(true);
    expect(exposed(wrapper).play('B2')).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.chess-piece-stone')).toHaveLength(2);

    const updates = wrapper.emitted('update') ?? [];
    const moves = wrapper.emitted('move') ?? [];
    expect(updates).toHaveLength(2);
    expect(moves).toHaveLength(2);
    expect(updates[0]?.[0]).toMatchObject({
      size: 3,
      player: -1,
      ko: undefined,
    });
    expect(moves[0]?.[0]).toMatchObject({
      latestVertex: [0, 2],
      player: -1,
      ko: undefined,
    });
    expect(updates[1]?.[0]).toMatchObject({ latestVertex: [1, 1] });
    expect(updates[0]?.[0]).not.toHaveProperty('position');
    expect(moves[0]?.[0]).not.toHaveProperty('position');
    expect((moves[0]?.[0] as { layout: GoLayout }).layout).not.toBe((moves[1]?.[0] as { layout: GoLayout }).layout);
  });

  it('marks the latest position supplied by the initialized game state', () => {
    const wrapper = mount(GoBoard, {
      props: {
        init: {
          size: 3,
          layout: [
            [0, 0, 0],
            [0, -1, 0],
            [1, 0, 0],
          ],
          player: 1,
          latestVertex: [1, 1],
        },
      },
    });

    expect(wrapper.find('[aria-label="B2"] .chess-piece-stone-marked').exists()).toBe(true);
    expect(wrapper.findAll('.chess-piece-stone-marked')).toHaveLength(1);
  });

  it('restores and isolates the latest position through reset and emitted events', async () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });
    const api = exposed(wrapper);

    expect(api.play('A1')).toBe(true);
    await nextTick();
    const move = wrapper.emitted('move')?.[0]?.[0] as { latestVertex: [number, number] };
    move.latestVertex[0] = 2;
    expect(wrapper.find('[aria-label="A1"] .chess-piece-stone-marked').exists()).toBe(true);

    const layout = emptyLayout(3);
    layout[0][2] = 1;
    expect(api.reset({ size: 3, layout, player: -1, latestVertex: [2, 0] })).toBe(true);
    await nextTick();
    expect(wrapper.find('[aria-label="C3"] .chess-piece-stone-marked').exists()).toBe(true);
    expect(wrapper.findAll('.chess-piece-stone-marked')).toHaveLength(1);
  });

  it('marks only the latest played piece', async () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });
    const api = exposed(wrapper);

    expect(wrapper.find('.chess-piece-stone-marked').exists()).toBe(false);
    expect(api.play('a1')).toBe(true);
    await nextTick();
    expect(wrapper.find('[aria-label="A1"] .chess-piece-stone-marked').exists()).toBe(true);

    expect(api.play('B2')).toBe(true);
    await nextTick();
    expect(wrapper.find('[aria-label="A1"] .chess-piece-stone-marked').exists()).toBe(false);
    expect(wrapper.find('[aria-label="B2"] .chess-piece-stone-marked').exists()).toBe(true);
    expect(wrapper.findAll('.chess-piece-stone-marked')).toHaveLength(1);

    expect(api.play('B2')).toBe(false);
    expect(api.play()).toBe(true);
    await nextTick();
    expect(wrapper.find('[aria-label="B2"] .chess-piece-stone-marked').exists()).toBe(true);
  });

  it('rejects occupied and invalid positions without events', () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });
    const api = exposed(wrapper);

    expect(api.play('A1')).toBe(true);
    expect(api.play('A1')).toBe(false);
    expect(api.play('I1')).toBe(false);
    expect(api.play('D4')).toBe(false);
    expect(api.play([3, 3])).toBe(false);
    expect(wrapper.emitted('update')).toHaveLength(1);
    expect(wrapper.emitted('move')).toHaveLength(1);
  });

  it('supports passing and reset', async () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });
    const api = exposed(wrapper);

    expect(api.play()).toBe(true);
    expect(api.play('   ')).toBe(false);
    expect(wrapper.emitted('update')?.[0]?.[0]).toMatchObject({ latestVertex: undefined });
    expect(api.play('A1')).toBe(true);
    expect(api.play()).toBe(true);
    expect(wrapper.emitted('update')?.[2]?.[0]).toMatchObject({ latestVertex: [0, 2] });
    expect(api.reset()).toBe(true);
    expect(wrapper.emitted('update')?.[3]?.[0]).toMatchObject({ latestVertex: undefined });
    await nextTick();
    expect(wrapper.findAll('.chess-piece-stone')).toHaveLength(0);
    expect(api.play('A1')).toBe(true);

    const resetLayout = emptyLayout(3);
    resetLayout[2][2] = 1;
    expect(api.reset({ layout: resetLayout, player: -1, latestVertex: [0, 0] })).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.chess-piece-stone')).toHaveLength(1);
    expect(wrapper.find('.chess-piece-stone-black').exists()).toBe(true);
    expect(wrapper.find('.chess-piece-stone-marked').exists()).toBe(false);
    expect(api.reset({ size: 5 })).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.chess-grid-cell')).toHaveLength(25);
    expect(wrapper.find('.chessboard').attributes('aria-rowcount')).toBe('5');
    expect(api.reset({ layout: [[1]], player: 1 })).toBe(false);
  });

  it('shows a preview for a legal hovered move and hides it after leaving', async () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });
    const cell = wrapper.find('[aria-label="A1"]');

    await cell.trigger('mouseenter');
    expect(wrapper.find('.chess-piece-stone-preview').exists()).toBe(true);
    await wrapper.find('.chessboard').trigger('mouseleave');
    expect(wrapper.find('.chess-piece-stone-preview').exists()).toBe(false);

    expect(exposed(wrapper).play('A1')).toBe(true);
    await nextTick();
    await cell.trigger('mouseenter');
    expect(wrapper.find('.chess-piece-stone-preview').exists()).toBe(false);
  });

  it('disables board cells and suppresses mouse interactions when disabled', async () => {
    const wrapper = mount(GoBoard, { props: { disabled: true, init: { size: 3 } } });

    expect(wrapper.findAll('.chess-grid-cell').every(cell => cell.attributes('disabled') !== undefined)).toBe(true);

    const cell = wrapper.find('[aria-label="A1"]');
    await cell.trigger('mouseenter');
    await cell.trigger('click');

    expect(wrapper.find('.chess-piece-stone-preview').exists()).toBe(false);
    expect(wrapper.find('.chess-piece-stone').exists()).toBe(false);
    expect(wrapper.emitted('move')).toBeUndefined();
    expect(wrapper.emitted('update')).toBeUndefined();
  });

  it('plays a move from a mouse click', async () => {
    const wrapper = mount(GoBoard, { props: { init: { size: 3 } } });

    await wrapper.find('[aria-label="A1"]').trigger('click');
    expect(wrapper.find('.chess-piece-stone-black').exists()).toBe(true);
    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({ latestVertex: [0, 2] });
  });

  it('applies initialized ko information', () => {
    const wrapper = mount(GoBoard, {
      props: {
        init: {
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
        },
      },
    });

    expect(exposed(wrapper).play('C4')).toBe(false);
    expect(wrapper.emitted('move')).toBeUndefined();
  });

  it('captures surrounded stones and rejects suicide', async () => {
    const layout: GoLayout = [
      [1, -1, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];
    const wrapper = mount(GoBoard, { props: { init: { size: 3, layout, player: 1 } } });
    const api = exposed(wrapper);

    expect(api.play('C3')).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.chess-piece-stone')).toHaveLength(3);
    expect(wrapper.find('.chess-piece-stone-white').exists()).toBe(false);

    const suicideLayout: GoLayout = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ];
    const suicideWrapper = mount(GoBoard, {
      props: {
        size: 3,
        init: { size: 3, layout: suicideLayout, player: -1 },
      },
    });
    expect(exposed(suicideWrapper).play('B2')).toBe(false);
  });

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
    expect(saveWrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
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
    expect(saveWrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
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
    expect(saveWrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
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

    expect(saveWrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
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
    expect(saveWrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
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
    expect(saveWrapper.emitted('update:value')?.at(-1)?.[0]).toEqual([
      expect.objectContaining({ layout: archivedLayout, player: 1 }),
    ]);
  });
});
