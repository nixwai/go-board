import type { GoLayout } from '@go-board/tool';
import type { MaybeRefOrGetter } from 'vue';
import { getInfluenceLayout } from '@go-board/tool';
import { ref, toValue, watch } from 'vue';

const DEFAULT_INFLUENCE_MIN_STONE_RATIO = 0.1;

/** 形势分析组合式函数的输入配置。 */
export interface UseInfluenceOptions {
  /** 当前棋盘布局。 */
  layout: MaybeRefOrGetter<GoLayout>
  /** 是否显示形势。 */
  showInfluence: MaybeRefOrGetter<boolean>
  /** 计算形势所需的最小棋子占比。 */
  influenceMinStoneRatio: MaybeRefOrGetter<number>
}

/** 只有棋子数量达到配置比例时才启动形势分析，避免开局阶段无效计算。 */
function shouldCalculateInfluence(layout: GoLayout, minStoneRatio: number): boolean {
  const totalPoints = layout.reduce((total, row) => total + row.length, 0);
  if (totalPoints === 0) { return false; }

  const stoneCount = layout.reduce(
    (total, row) => total + row.filter(sign => sign !== 0).length,
    0,
  );

  return stoneCount / totalPoints >= minStoneRatio;
}

/** 将形势分析比例限制在 0～1，避免无效配置破坏计算条件。 */
function normalizeInfluenceMinStoneRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) { return DEFAULT_INFLUENCE_MIN_STONE_RATIO; }

  return Math.min(Math.max(ratio, 0), 1);
}

/** 管理形势分析结果，并忽略已经过期的异步分析结果。 */
export function useInfluence(options: UseInfluenceOptions) {
  const influenceLayout = ref<GoLayout>();

  watch(
    [
      () => toValue(options.showInfluence),
      () => toValue(options.influenceMinStoneRatio),
      () => toValue(options.layout),
    ],
    ([showInfluence, minStoneRatio, layout], _, onCleanup) => {
      let active = true;
      onCleanup(() => {
        active = false;
      });

      if (!showInfluence || !shouldCalculateInfluence(
        layout,
        normalizeInfluenceMinStoneRatio(minStoneRatio),
      )) {
        influenceLayout.value = undefined;
        return;
      }

      influenceLayout.value = undefined;
      void getInfluenceLayout(layout)
        .then((result) => {
          if (active) {
            influenceLayout.value = result;
          }
        })
        .catch((error: unknown) => {
          console.error('[GoBoard] 概率形势分析失败。', error);
        });
    },
    { immediate: true },
  );

  return { influenceLayout };
}
