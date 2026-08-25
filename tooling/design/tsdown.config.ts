import { resolve } from 'node:path';
import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';
import { designOutput, designRoot, projRoot } from './paths.ts';

const sharedConfig = {
  cwd: designRoot,
  entry: { index: 'src/index.ts' },
  root: '.',
  unbundle: true,
  sourcemap: true,
  clean: false,
  platform: 'neutral' as const,
  deps: { neverBundle: ['vue', '@go-board/tool', '@go-board/ui'] },
  plugins: [
    Vue({ isProduction: true }),
  ],
  outputOptions: {
    exports: 'named' as const,
    preserveModulesRoot: designRoot,
  },
};

export default defineConfig([
  {
    ...sharedConfig,
    format: 'esm',
    dts: false,
    outDir: resolve(designOutput, 'es'),
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
    outDir: resolve(designOutput, 'lib'),
    outExtensions: () => ({ js: '.js' }),
    css: {
      splitting: true,
      inject: true,
    },
  },
  {
    ...sharedConfig,
    format: 'esm',
    outDir: resolve(designOutput, 'types'),
    dts: {
      vue: true,
      emitDtsOnly: true,
      tsconfig: resolve(projRoot, 'tsconfig.json'),
    },
    plugins: [],
  },
]);
