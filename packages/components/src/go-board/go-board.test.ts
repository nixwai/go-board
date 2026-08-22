import type { GoLayout } from '../types';
import type { GoGameOptions } from '../utils/go-game';
import type { GoBoardExposed } from './go-board';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import GoBoard from './go-board.vue';

function emptyLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array.from({ length: size }).fill(0)) as GoLayout;
}

function exposed(wrapper: ReturnType<typeof mount>): GoBoardExposed {
  return wrapper.vm as unknown as GoBoardExposed;
}

describe('goBoard', () => {
  it('forwards root aria and DOM attributes through chessboard', () => {
    const wrapper = mount(GoBoard, {
      attrs: {
        'aria-label': 'go board',
        'data-testid': 'go-board',
      },
    });

    expect(wrapper.find('.go-board').attributes('aria-label')).toBe('go board');
    expect(wrapper.find('.go-board').attributes('data-testid')).toBe('go-board');
  });

  it('renders a default 19 by 19 board', () => {
    const wrapper = mount(GoBoard);

    expect(wrapper.findAll('.go-board__cell')).toHaveLength(19 * 19);
    expect(wrapper.find('.go-board').attributes('style')).toContain('width: 100%');
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
    const wrapper = mount(GoBoard, { props: { size: 3, init } });

    expect(wrapper.findAll('.go-board__stone')).toHaveLength(2);
    expect(exposed(wrapper).play('C1')).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.go-board__stone--white')).toHaveLength(2);
  });

  it('falls back to an empty board for invalid initialization', async () => {
    const wrapper = mount(GoBoard, {
      props: {
        size: 3,
        init: { layout: [[1, 0]], player: -1 },
      },
    });

    expect(wrapper.findAll('.go-board__stone')).toHaveLength(0);
    expect(exposed(wrapper).play('A1')).toBe(true);
    await nextTick();
    expect(wrapper.find('.go-board__stone--black').exists()).toBe(true);
  });

  it('plays moves, alternates signs, and emits update and move snapshots', async () => {
    const wrapper = mount(GoBoard, { props: { size: 3 } });

    expect(exposed(wrapper).play('a1')).toBe(true);
    await nextTick();
    expect(wrapper.find('.go-board__stone--black').exists()).toBe(true);
    expect(exposed(wrapper).play('B2')).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.go-board__stone')).toHaveLength(2);

    const updates = wrapper.emitted('update') ?? [];
    const moves = wrapper.emitted('move') ?? [];
    expect(updates).toHaveLength(2);
    expect(moves).toHaveLength(2);
    expect(moves[0]?.[0]).toMatchObject({ position: 'A1', next: -1 });
    expect((moves[0]?.[0] as { layout: GoLayout }).layout).not.toBe((moves[1]?.[0] as { layout: GoLayout }).layout);
  });

  it('rejects occupied and invalid positions without events', () => {
    const wrapper = mount(GoBoard, { props: { size: 3 } });
    const api = exposed(wrapper);

    expect(api.play('A1')).toBe(true);
    expect(api.play('A1')).toBe(false);
    expect(api.play('I1')).toBe(false);
    expect(api.play('D4')).toBe(false);
    expect(wrapper.emitted('update')).toHaveLength(1);
    expect(wrapper.emitted('move')).toHaveLength(1);
  });

  it('supports passing and reset', async () => {
    const wrapper = mount(GoBoard, { props: { size: 3 } });
    const api = exposed(wrapper);

    expect(api.play()).toBe(true);
    expect(api.play('A1')).toBe(true);
    expect(api.reset()).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.go-board__stone')).toHaveLength(0);
    expect(api.play('A1')).toBe(true);

    const resetLayout = emptyLayout(3);
    resetLayout[2][2] = 1;
    expect(api.reset({ layout: resetLayout, player: -1 })).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.go-board__stone')).toHaveLength(1);
    expect(wrapper.find('.go-board__stone--black').exists()).toBe(true);
    expect(api.reset({ size: 5 })).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.go-board__cell')).toHaveLength(25);
    expect(wrapper.find('.go-board').attributes('aria-rowcount')).toBe('5');
    expect(api.reset({ layout: [[1]], player: 1 })).toBe(false);
  });

  it('shows a preview for a legal hovered move and hides it after leaving', async () => {
    const wrapper = mount(GoBoard, { props: { size: 3 } });
    const cell = wrapper.find('[aria-label="A1"]');

    await cell.trigger('mouseenter');
    expect(wrapper.find('.go-board__stone--preview').exists()).toBe(true);
    await wrapper.find('.go-board').trigger('mouseleave');
    expect(wrapper.find('.go-board__stone--preview').exists()).toBe(false);
  });

  it('plays a move from a mouse click', async () => {
    const wrapper = mount(GoBoard, { props: { size: 3 } });

    await wrapper.find('[aria-label="A1"]').trigger('click');
    expect(wrapper.find('.go-board__stone--black').exists()).toBe(true);
    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({ position: 'A1' });
  });

  it('captures surrounded stones and rejects suicide', async () => {
    const layout: GoLayout = [
      [1, -1, 0],
      [0, 1, 0],
      [0, 0, 0],
    ];
    const wrapper = mount(GoBoard, { props: { size: 3, init: { layout, player: 1 } } });
    const api = exposed(wrapper);

    expect(api.play('C3')).toBe(true);
    await nextTick();
    expect(wrapper.findAll('.go-board__stone')).toHaveLength(3);
    expect(wrapper.find('.go-board__stone--white').exists()).toBe(false);

    const suicideLayout: GoLayout = [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ];
    const suicideWrapper = mount(GoBoard, {
      props: {
        size: 3,
        init: { layout: suicideLayout, player: -1 },
      },
    });
    expect(exposed(suicideWrapper).play('B2')).toBe(false);
  });
});
