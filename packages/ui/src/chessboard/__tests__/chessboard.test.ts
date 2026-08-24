import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Chessboard from '../src/chessboard.vue';

function getPointCoordinates(size: number) {
  return (position: number) => `${((position + 0.5) / size) * 100}`;
}

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

  it('renders the center star only for odd boards smaller than 9', () => {
    for (const size of [1, 7]) {
      const wrapper = mount(Chessboard, { props: { size } });
      const point = wrapper.find('.chessboard-stars circle');
      const coordinate = getPointCoordinates(size)((size - 1) / 2);

      expect(wrapper.findAll('.chessboard-stars circle')).toHaveLength(1);
      expect(point.attributes()).toMatchObject({ cx: coordinate, cy: coordinate, r: '0.625' });
    }
  });

  it('does not render stars for even boards smaller than 9', () => {
    for (const size of [2, 8]) {
      const wrapper = mount(Chessboard, { props: { size } });

      expect(wrapper.findAll('.chessboard-stars circle')).toHaveLength(0);
    }
  });

  it('renders four corner stars and an optional center star for sizes 9 through 12', () => {
    for (const size of [9, 10, 11, 12]) {
      const wrapper = mount(Chessboard, { props: { size } });
      const coordinate = getPointCoordinates(size);
      const cornerPoints = [
        [2, 2],
        [size - 3, 2],
        [2, size - 3],
        [size - 3, size - 3],
      ];
      const expected = size % 2 === 0
        ? cornerPoints
        : [...cornerPoints, [(size - 1) / 2, (size - 1) / 2]];

      expect(wrapper.findAll('.chessboard-stars circle')).toHaveLength(expected.length);
      expect(wrapper.findAll('.chessboard-stars circle').map(circle => circle.attributes())).toEqual(
        expected.map(([x, y]) => ({ cx: coordinate(x), cy: coordinate(y), r: '0.625' })),
      );
    }
  });

  it('renders corner stars and optional center stars for sizes 13 or larger', () => {
    for (const size of [13, 14, 19]) {
      const wrapper = mount(Chessboard, { props: { size } });
      const coordinate = getPointCoordinates(size);
      const center = (size - 1) / 2;
      const anchors = [3, center, size - 4];
      const expected = size % 2 === 0
        ? [
            [3, 3],
            [size - 4, 3],
            [3, size - 4],
            [size - 4, size - 4],
          ]
        : anchors.flatMap(x => anchors.map(y => [x, y]));

      expect(wrapper.findAll('.chessboard-stars circle')).toHaveLength(expected.length);
      expect(wrapper.findAll('.chessboard-stars circle').map(circle => circle.attributes())).toEqual(
        expected.map(([x, y]) => ({ cx: coordinate(x), cy: coordinate(y), r: '0.625' })),
      );
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
