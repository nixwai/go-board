import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChessPiece from '../src/chess-piece.vue';

describe('chessPiece', () => {
  it('renders a black or white piece from the sign', () => {
    const black = mount(ChessPiece, { props: { sign: 1 } });
    const white = mount(ChessPiece, { props: { sign: -1 } });

    expect(black.find('.go-board__stone').classes()).toContain('go-board__stone--black');
    expect(white.find('.go-board__stone').classes()).toContain('go-board__stone--white');
  });

  it('renders a preview piece', () => {
    const wrapper = mount(ChessPiece, { props: { sign: 1, preview: true } });

    expect(wrapper.find('.go-board__stone').classes()).toEqual([
      'go-board__stone',
      'go-board__stone--black',
      'go-board__stone--preview',
    ]);
  });
});
