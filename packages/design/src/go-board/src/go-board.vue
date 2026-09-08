<script setup lang="ts">
import type { GoGameOptions, GoGamePosition, GoGameSnapshot, GoVertex } from '@go-board/tool';
import type { GoSaveChange } from '../../go-save/src/go-save';
import type { GoBoardExposed, GoBoardProps } from './go-board';

import { getInfluenceLayout, GoGameData, vertexEquals } from '@go-board/tool';
import { Chessboard, ChessGrid, ChessInfluence, ChessPiece } from '@go-board/ui';
import { inject, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { GO_SAVE_EVENT, GO_SAVE_INJECTION } from '../../go-save/src/keys';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), {
  disabled: false,
  showCoord: false,
  showInfluence: false,
  influenceMinStoneRatio: 0.1,
  width: '100%',
});

const emit = defineEmits<{
  update: [payload: GoGameSnapshot]
  move: [payload: GoGameSnapshot]
}>();

const DEFAULT_INFLUENCE_MIN_STONE_RATIO = 0.1;

const goSave = inject(GO_SAVE_INJECTION);
let archiveMutationDepth = 0;

/** 标记棋盘主动写入存档的同步调用，避免重复处理自身产生的事件。 */
function runArchiveMutation<T, P extends unknown[]>(mutation?: (...params: P) => T) {
  return (...params: P) => {
    archiveMutationDepth += 1;
    try {
      return mutation?.(...params);
    }
    finally {
      archiveMutationDepth -= 1;
    }
  };
}

const saveToArchive = runArchiveMutation(goSave?.save);
const resetArchive = runArchiveMutation(goSave?.reset);

/** 由规则引擎维护对局状态，组件状态仅负责驱动视图。 */
const goGameData = new GoGameData(props.init);
const goSnapshot = ref<GoGameSnapshot>(goGameData.snapshot);
/** 当前展示的黑白双方离散势力归属。 */
const influenceLayout = ref<GoGameSnapshot['layout']>();

/** 只有棋子数量达到配置比例时才启动形势分析，避免开局阶段无效计算。 */
function shouldCalculateInfluence(
  layout: GoGameSnapshot['layout'],
  minStoneRatio: number,
): boolean {
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

/** 显示形势时异步获取概率归属结果，并忽略过期分析结果。 */
watch(
  [
    () => props.showInfluence,
    () => props.influenceMinStoneRatio,
    () => goSnapshot.value.layout,
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
const hoverPosition = ref<GoVertex>();

/** 通知外部当前完整对局快照。 */
function emitUpdate() {
  emit('update', goSnapshot.value);
}

/** 保存并通知外部落子后的完整对局快照。 */
function emitMove() {
  emit('move', goSnapshot.value);
}

/** 将规则引擎快照同步到组件响应式状态。 */
function refresh() {
  goSnapshot.value = goGameData.snapshot;
  clearHover();
}

/** 处理外部或单元点击触发的落子流程。 */
function play(position?: GoGamePosition): boolean {
  if (position && !goGameData.play(position)) { return false; }

  goGameData.rotate();
  refresh();
  if (position) {
    saveToArchive(goSnapshot.value);
    emitMove();
  }
  emitUpdate();
  return true;
}

/** 重置对局，清除旧存档并保存唯一的重置快照。 */
function reset(options?: GoGameOptions): boolean {
  if (!goGameData.reset(options)) { return false; }
  refresh();
  resetArchive(goSnapshot.value);
  emitUpdate();
  return true;
}

/** 仅在当前位置可合法落子时显示预览棋子。 */
function setHover(position: GoVertex) {
  hoverPosition.value = goGameData.isLegal(position) ? position : undefined;
}

/** 离开棋盘时清除落子预览。 */
function clearHover() {
  hoverPosition.value = undefined;
}

/** 暴露给父组件的对局控制方法。 */
defineExpose<GoBoardExposed>({ play, reset });

if (goSave) {
  const goSaveContext = goSave;

  /** 重置棋盘后延迟补全空历史，并通过版本校验取消过期保存任务。 */
  function resetHistory(snapshot?: GoGameOptions) {
    if (!goGameData.reset(snapshot)) { return; }

    refresh();
    emitUpdate();
    if (goSaveContext.length !== 0) { return; }

    const version = goSaveContext.version;
    const currentSnapshot = goSnapshot.value;
    void nextTick(() => {
      if (version !== goSaveContext.version || goSaveContext.length) {
        return;
      }

      saveToArchive(currentSnapshot);
    });
  }

  /** 根据存档事件同步棋盘；事件处理只更新棋盘，不触发新的存档操作。 */
  function onSaveChange(change: GoSaveChange) {
    if (archiveMutationDepth > 0) { return; }

    switch (change.key) {
      case GO_SAVE_EVENT.REBUILD:
      case GO_SAVE_EVENT.CLEAR:
        resetHistory(change.snapshot);
        break;
      case GO_SAVE_EVENT.RESET:
        if (!change.snapshot || !goGameData.reset(change.snapshot)) { break; }
        refresh();
        emitUpdate();
        break;
      case GO_SAVE_EVENT.SAVE:
      case GO_SAVE_EVENT.LOAD:
      case GO_SAVE_EVENT.FORWARD:
      case GO_SAVE_EVENT.BACKWARD:
        if (!change.snapshot || !goGameData.update(change.snapshot)) { break; }
        refresh();
        emitUpdate();
        break;
    }
  }
  goSaveContext.onListen(onSaveChange, onBeforeUnmount);
}
</script>

<template>
  <Chessboard
    :size="goSnapshot.size"
    :width="props.width"
    :show-coord="props.showCoord"
    role="grid"
    :aria-rowcount="goSnapshot.size"
    :aria-colcount="goSnapshot.size"
    @mouseleave="clearHover"
  >
    <ChessGrid
      :rows="goSnapshot.layout"
      :influences="influenceLayout"
      :disabled="props.disabled"
      @cell-mouseenter="setHover"
      @cell-click="play"
    >
      <template #default="{ sign, influence, position }">
        <ChessPiece
          v-if="sign"
          :sign="sign"
          :marked="vertexEquals(position, goSnapshot.latestVertex)"
        />
        <ChessPiece
          v-else-if="vertexEquals(position, hoverPosition)"
          :sign="goSnapshot.player"
          preview
        />
        <ChessInfluence
          v-if="influence && influence !== sign"
          :sign="influence"
        />
      </template>
    </ChessGrid>
  </Chessboard>
</template>
