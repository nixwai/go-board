import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChessPiece from '../src/chess-piece.vue';

describe('chessPiece', () => {
  it('renders a black or white piece from the sign', () => {
    const black = mount(ChessPiece, { props: { sign: 1 } });
    const white = mount(ChessPiece, { props: { sign: -1 } });

    expect(black.find('.chess-piece-stone').classes()).toContain('chess-piece-stone-black');
    expect(white.find('.chess-piece-stone').classes()).toContain('chess-piece-stone-white');
    expect(black.find('.chess-piece-stone').classes()).not.toContain('chess-piece-stone-marked');
  });

  it('renders a preview piece', () => {
    const wrapper = mount(ChessPiece, { props: { sign: 1, preview: true } });

    expect(wrapper.find('.chess-piece-stone').classes()).toEqual([
      'chess-piece-stone',
      'chess-piece-stone-black',
      'chess-piece-stone-preview',
    ]);
  });

  it('renders the marked state for the latest piece', () => {
    const black = mount(ChessPiece, { props: { sign: 1, marked: true } });
    const white = mount(ChessPiece, { props: { sign: -1, marked: true } });

    expect(black.find('.chess-piece-stone').classes()).toContain('chess-piece-stone-marked');
    expect(white.find('.chess-piece-stone').classes()).toContain('chess-piece-stone-marked');
  });

  it('draws a centered hollow marker in the opposite piece color', () => {
    const source = readFileSync(resolve(process.cwd(), 'packages/ui/src/chess-piece/src/chess-piece.vue'), 'utf8');
    const blackStyle = source.match(/\.chess-piece-stone-black\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    const whiteStyle = source.match(/\.chess-piece-stone-white\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    const markerStyle = source.match(/\.chess-piece-stone-marked::after\s*\{([\s\S]*?)\}/)?.[1] ?? '';

    expect(blackStyle).toMatch(/--chess-piece-marker-color:\s*#fff/);
    expect(whiteStyle).toMatch(/--chess-piece-marker-color:\s*#000/);
    expect(markerStyle).toMatch(/top:\s*50%/);
    expect(markerStyle).toMatch(/left:\s*50%/);
    expect(markerStyle).toMatch(/content:\s*''/);
    expect(markerStyle).toMatch(/border:\s*2px solid var\(--chess-piece-marker-color\)/);
    expect(markerStyle).toMatch(/border-radius:\s*50%/);
    expect(markerStyle).toMatch(/transform:\s*translate\(-50%, -50%\)/);
  });
});
