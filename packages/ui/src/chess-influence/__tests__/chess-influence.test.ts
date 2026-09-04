import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createApp } from 'vue';
import installer from '../../installer';
import { ChessInfluence as InstalledChessInfluence } from '../index';
import ChessInfluence from '../src/chess-influence.vue';

describe('chessInfluence', () => {
  it('renders a black influence cube', () => {
    const wrapper = mount(ChessInfluence, { props: { sign: 1 } });

    expect(wrapper.find('.chess-influence-cube').classes()).toContain('chess-influence-cube-black');
    expect(wrapper.find('.chess-influence-cube').classes()).not.toContain('chess-influence-cube-white');
  });

  it('renders a white influence cube', () => {
    const wrapper = mount(ChessInfluence, { props: { sign: -1 } });

    expect(wrapper.find('.chess-influence-cube').classes()).toContain('chess-influence-cube-white');
    expect(wrapper.find('.chess-influence-cube').classes()).not.toContain('chess-influence-cube-black');
  });

  it('uses a centered cube that occupies a quarter of the cell', () => {
    const source = readFileSync(resolve(process.cwd(), 'packages/ui/src/chess-influence/src/chess-influence.vue'), 'utf8');
    const style = source.match(/\.chess-influence-cube\s*\{([\s\S]*?)\}/)?.[1] ?? '';

    expect(style).toMatch(/top:\s*50%/);
    expect(style).toMatch(/left:\s*50%/);
    expect(style).toMatch(/width:\s*25%/);
    expect(style).toMatch(/height:\s*25%/);
    expect(style).toMatch(/transform:\s*translate\(-50%, -50%\)/);
  });

  it('exports a single-install plugin and is included in the full installer', () => {
    expect(InstalledChessInfluence.install).toBeTypeOf('function');

    const app = createApp({});
    app.use(installer);

    expect(app.component('ChessInfluence')).toBe(InstalledChessInfluence);
  });
});
