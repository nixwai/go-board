import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChessGrid from '../src/chess-grid.vue';

describe('chessGrid', () => {
  it('renders cells and passes sign and position to the scoped slot', () => {
    const wrapper = mount(ChessGrid, {
      props: {
        rows: [
          [1, 0],
          [0, -1],
        ],
      },
      slots: { default: ({ sign, position }) => `${position}:${sign}` },
    });

    expect(wrapper.findAll('.chess-grid-cell')).toHaveLength(4);
    expect(wrapper.findAll('.chess-grid-cell').map(cell => cell.text())).toEqual([
      'A2:1',
      'B2:0',
      'A1:0',
      'B1:-1',
    ]);
  });

  it('forwards DOM attributes to the grid root', () => {
    const wrapper = mount(ChessGrid, {
      props: { rows: [[0]] },
      attrs: { 'data-testid': 'chess-grid' },
    });

    expect(wrapper.find('.chess-grid').attributes('data-testid')).toBe('chess-grid');
  });

  it('emits cell interactions with the cell position', async () => {
    const wrapper = mount(ChessGrid, { props: { rows: [[0]] } });

    const cell = wrapper.find('.chess-grid-cell');
    await cell.trigger('mouseenter');
    await cell.trigger('click');

    expect(wrapper.emitted('cellMouseenter')).toEqual([['A1']]);
    expect(wrapper.emitted('cellClick')).toEqual([['A1']]);
  });
});
