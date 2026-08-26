import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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

  it('does not render board lines', () => {
    const wrapper = mount(ChessGrid, { props: { rows: [[0]] } });

    expect(wrapper.find('.chess-grid-lines').exists()).toBe(false);
  });

  it('keeps the grid in the board guide overlay area', () => {
    const source = readFileSync(resolve(process.cwd(), 'packages/ui/src/chess-grid/src/chess-grid.vue'), 'utf8');
    const style = source.match(/\.chess-grid\s*\{([\s\S]*?)\}/)?.[1] ?? '';

    expect(style).toMatch(/position:\s*absolute/);
    expect(style).toMatch(/inset:\s*1\.5%/);
    expect(style).toMatch(/width:\s*calc\(100% - 3%\)/);
    expect(style).toMatch(/height:\s*calc\(100% - 3%\)/);
  });

  it('forwards DOM attributes to the grid root', () => {
    const wrapper = mount(ChessGrid, {
      props: { rows: [[0]] },
      attrs: { 'data-testid': 'chess-grid' },
    });

    expect(wrapper.find('.chess-grid').attributes('data-testid')).toBe('chess-grid');
  });

  it('disables cells and suppresses interactions when disabled', async () => {
    const wrapper = mount(ChessGrid, { props: { rows: [[0, 0]], disabled: true } });

    expect(wrapper.findAll('.chess-grid-cell').every(cell => cell.attributes('disabled') !== undefined)).toBe(true);

    const cell = wrapper.find('.chess-grid-cell');
    await cell.trigger('mouseenter');
    await cell.trigger('click');

    expect(wrapper.emitted('cellMouseenter')).toBeUndefined();
    expect(wrapper.emitted('cellClick')).toBeUndefined();
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
