<script setup lang="ts">
import type { GoGameOptions, GoGamePosition, GoGameSnapshot, GoVertex } from '@go-board/tool';
import type { GoSaveChange } from '../../go-save/src/go-save';
import type { GoBoardExposed, GoBoardProps } from './go-board';

import { GoGameData, vertexEquals } from '@go-board/tool';
import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { nextTick, ref } from 'vue';
import { useGoSave } from '../../composables/use-go-save';
import { GO_SAVE_EVENT } from '../../go-save/src/keys';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), {
  disabled: false,
  showCoord: false,
  width: '100%',
});

const emit = defineEmits<{
  update: [payload: GoGameSnapshot]
  move: [payload: GoGameSnapshot]
}>();

const {
  isValid: hasGoSave,
  version: archiveVersion,
  snapshotLen: archiveSnapshotLen,
  saveSnapshot: saveToArchive,
  resetSnapshot: resetArchive,
  onSnapshotListen,
} = useGoSave();

/** 由规则引擎维护对局状态，组件状态仅负责驱动视图。 */
const goGameData = new GoGameData(props.init);
const goSnapshot = ref<GoGameSnapshot>(goGameData.snapshot);
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

if (hasGoSave) {
  /** 重置棋盘后延迟补全空历史，并通过版本校验取消过期保存任务。 */
  function resetHistory(snapshot?: GoGameOptions) {
    if (!goGameData.reset(snapshot)) { return; }

    refresh();
    emitUpdate();
    if (archiveSnapshotLen.value !== 0) { return; }

    const version = archiveVersion.value;
    const currentSnapshot = goSnapshot.value;
    void nextTick(() => {
      if (version !== archiveVersion.value || archiveSnapshotLen.value) {
        return;
      }

      saveToArchive(currentSnapshot);
    });
  }

  /** 根据存档事件同步棋盘；事件处理只更新棋盘，不触发新的存档操作。 */
  function onSaveChange(change: GoSaveChange) {
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
  onSnapshotListen(onSaveChange);
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
      :disabled="props.disabled"
      @cell-mouseenter="setHover"
      @cell-click="play"
    >
      <template #default="{ sign, position }">
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
      </template>
    </ChessGrid>
  </Chessboard>
</template>
