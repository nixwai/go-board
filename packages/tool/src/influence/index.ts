import type { GoLayout, GoSign } from '../types';
import { getProbabilityMap, useFetch } from '@sabaki/deadstones';
import { cloneLayout } from '../create';

/** 绝对概率低于或等于该值时，视为中立区域。 */
const INFLUENCE_THRESHOLD = 0.15;
/** 默认随机终局模拟次数。 */
const DEFAULT_INFLUENCE_ITERATIONS = 200;
/** 防止无界配置导致前端长时间阻塞。 */
const MAX_INFLUENCE_ITERATIONS = 2000;

let browserWasmSetup: Promise<void> | undefined;

/** 形势分析配置。 */
export interface GoInfluenceOptions {
  /** 随机终局模拟次数。 */
  iterations?: number
}

/** 将概率值转换为黑方、白方或中立势力。 */
function normalizeInfluence(value: number): GoSign {
  if (!Number.isFinite(value) || Math.abs(value) <= INFLUENCE_THRESHOLD) {
    return 0;
  }

  return value > 0 ? 1 : -1;
}

/** 将模拟次数限制为可控的正整数。 */
function normalizeIterations(iterations?: number): number {
  if (typeof iterations !== 'number' || !Number.isFinite(iterations)) {
    return DEFAULT_INFLUENCE_ITERATIONS;
  }

  return Math.min(Math.max(Math.trunc(iterations), 1), MAX_INFLUENCE_ITERATIONS);
}

/** 浏览器首次分析前配置依赖包的 WASM 资源地址。 */
async function setupBrowserWasm(): Promise<void> {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') {
    return;
  }

  browserWasmSetup ??= import('@sabaki/deadstones/wasm/deadstones_bg.wasm?url')
    .then(({ default: wasmUrl }) => {
      useFetch(wasmUrl);
    });

  await browserWasmSetup;
}

/** 使用 getProbabilityMap 计算黑白双方的离散势力归属。 */
export async function getInfluenceLayout(
  layout: GoLayout,
  options: GoInfluenceOptions = {},
): Promise<GoLayout> {
  const source = cloneLayout(layout);
  if (source.length === 0 || (source[0]?.length ?? 0) === 0) {
    return source;
  }
  if (source.every(row => row.every(sign => sign === 0))) {
    return source;
  }

  await setupBrowserWasm();
  const probability = await getProbabilityMap(source, normalizeIterations(options.iterations));

  return source.map((row, y) => row.map((_, x) => normalizeInfluence(probability[y]?.[x] ?? 0)));
}
