import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Chessboard from './chessboard.vue';

describe('chessboard', () => {
  it('renders the requested size and width', () => {
    const wrapper = mount(Chessboard, { props: { size: 3, width: 240 } });

    expect(wrapper.find('.go-board').attributes('style')).toContain('width: 240px');
    expect(wrapper.findAll('.go-board__cell')).toHaveLength(0);
  });

  it('forwards aria and DOM attributes to the root element', () => {
    const wrapper = mount(Chessboard, {
      attrs: {
        'aria-label': 'go board',
        'data-testid': 'chessboard',
        'tabindex': '0',
      },
    });

    const board = wrapper.find('.go-board');
    expect(board.attributes('aria-label')).toBe('go board');
    expect(board.attributes('data-testid')).toBe('chessboard');
    expect(board.attributes('tabindex')).toBe('0');
  });
});
