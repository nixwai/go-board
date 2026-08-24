import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Chessboard from '../src/chessboard.vue';

describe('chessboard', () => {
  it('renders the requested size and width', () => {
    const wrapper = mount(Chessboard, { props: { size: 3, width: 240 } });

    expect(wrapper.find('.chessboard').attributes('style')).toContain('width: 240px');
    expect(wrapper.findAll('.chess-grid-cell')).toHaveLength(0);
  });

  it('aligns every line intersection with the center of each board cell', () => {
    for (const size of [1, 2, 3, 19]) {
      const wrapper = mount(Chessboard, { props: { size } });
      const lines = wrapper.findAll('.chessboard-lines line');
      const firstCenter = ((1 - 0.5) / size) * 100;
      const lastCenter = ((size - 0.5) / size) * 100;

      expect(lines).toHaveLength(size * 2);
      expect(wrapper.find('.chessboard-lines').attributes()).toMatchObject({
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        fill: 'none',
      });
      expect(lines[0].attributes()).toMatchObject({
        x1: `${firstCenter}`,
        x2: `${lastCenter}`,
        y1: `${firstCenter}`,
        y2: `${firstCenter}`,
      });
      expect(lines[size - 1].attributes()).toMatchObject({
        x1: `${firstCenter}`,
        x2: `${lastCenter}`,
        y1: `${lastCenter}`,
        y2: `${lastCenter}`,
      });
      expect(lines[size].attributes()).toMatchObject({
        x1: `${firstCenter}`,
        x2: `${firstCenter}`,
        y1: `${firstCenter}`,
        y2: `${lastCenter}`,
      });
      expect(lines[(size * 2) - 1].attributes()).toMatchObject({
        x1: `${lastCenter}`,
        x2: `${lastCenter}`,
        y1: `${firstCenter}`,
        y2: `${lastCenter}`,
      });
    }
  });

  it('forwards aria and DOM attributes to the root element', () => {
    const wrapper = mount(Chessboard, {
      props: { size: 1 },
      attrs: {
        'aria-label': 'go board',
        'data-testid': 'chessboard',
        'tabindex': '0',
      },
    });

    const board = wrapper.find('.chessboard');
    expect(board.attributes('aria-label')).toBe('go board');
    expect(board.attributes('data-testid')).toBe('chessboard');
    expect(board.attributes('tabindex')).toBe('0');
  });
});
