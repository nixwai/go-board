import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChessPiece from '../src/chess-piece.vue';

describe('chessPiece', () => {
  it('renders a black or white piece from the sign', () => {
    const black = mount(ChessPiece, { props: { sign: 1 } });
    const white = mount(ChessPiece, { props: { sign: -1 } });

    expect(black.find('.chess-piece-stone').classes()).toContain('chess-piece-stone-black');
    expect(white.find('.chess-piece-stone').classes()).toContain('chess-piece-stone-white');
  });

  it('renders a preview piece', () => {
    const wrapper = mount(ChessPiece, { props: { sign: 1, preview: true } });

    expect(wrapper.find('.chess-piece-stone').classes()).toEqual([
      'chess-piece-stone',
      'chess-piece-stone-black',
      'chess-piece-stone-preview',
    ]);
  });
});
