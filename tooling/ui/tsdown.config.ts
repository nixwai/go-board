import { resolve } from 'node:path';
import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';
import { projRoot, uiOutput, uiRoot } from './paths.ts';

const sharedConfig = {
  cwd: uiRoot,
  entry: { index: 'src/index.ts' },
  root: '.',
  unbundle: true,
  sourcemap: true,
  clean: false,
  platform: 'neutral' as const,
  deps: { neverBundle: ['vue', '@go-board/tool'] },
  plugins: [
    Vue({ isProduction: true }),
  ],
  outputOptions: {
    exports: 'named' as const,
    preserveModulesRoot: uiRoot,
  },
};

export default defineConfig([
  {
    ...sharedConfig,
    format: 'esm',
    dts: false,
    outDir: resolve(uiOutput, 'es'),
    outExtensions: () => ({ js: '.mjs' }),
    css: {
      splitting: true,
      inject: true,
    },
  },
  {
    ...sharedConfig,
    format: 'cjs',
    dts: false,
    outDir: resolve(uiOutput, 'lib'),
    outExtensions: () => ({ js: '.js' }),
    css: {
      splitting: true,
      inject: true,
    },
  },
  {
    ...sharedConfig,
    format: 'esm',
    outDir: resolve(uiOutput, 'types'),
    dts: {
      vue: true,
      emitDtsOnly: true,
      tsconfig: resolve(projRoot, 'tsconfig.json'),
    },
    plugins: [],
  },
]);
