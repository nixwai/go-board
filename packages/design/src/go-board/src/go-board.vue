<script setup lang="ts">
import type { GoGameOptions, GoGamePosition, GoGameSnapshot, GoVertex } from '@go-board/tool';
import type { GoSaveChange } from '../../go-save/src/go-save';
import type { GoBoardEvent, GoBoardExposed, GoBoardProps } from './go-board';

import { GoGameData, vertexEquals } from '@go-board/tool';
import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { inject, onBeforeUnmount, ref } from 'vue';
import { GO_SAVE_EVENT, GO_SAVE_INJECTION } from '../../go-save/src/keys';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), {
  disabled: false,
  width: '100%',
});

const emit = defineEmits<{
  update: [payload: GoBoardEvent]
  move: [payload: GoBoardEvent]
}>();

const goSave = inject(GO_SAVE_INJECTION);

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
  goSave?.save(goSnapshot.value);
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
    emitMove();
  }
  emitUpdate();
  return true;
}

/** 重置对局，清除旧存档并保存唯一的重置快照。 */
function reset(options?: GoGameOptions): boolean {
  if (!goGameData.reset(options)) { return false; }
  refresh();
  goSave?.reset(goSnapshot.value);
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
  /** 使用存档快照替换当前棋盘，无效快照直接拒绝。 */
  function restore(snapshot?: GoGameOptions): boolean {
    if (!snapshot || !goGameData.reset(snapshot)) { return false; }

    refresh();
    emitUpdate();
    return true;
  }

  /** 重建时优先恢复存档；空存档使用初始化数据并创建首条快照。 */
  function rebuild(snapshot?: GoGameOptions) {
    if (snapshot) {
      restore(snapshot);
      return;
    }

    goGameData.reset(goGameData.cached);
    refresh();
    goSave?.save(goSnapshot.value);
    emitUpdate();
  }

  /** 根据存档事件同步棋盘，RESET 与 SAVE 由当前操作流程直接完成。 */
  function onSaveChange(change: GoSaveChange) {
    switch (change.key) {
      case GO_SAVE_EVENT.REBUILD:
        rebuild(change.snapshot);
        break;
      case GO_SAVE_EVENT.RESET:
      case GO_SAVE_EVENT.SAVE:
        break;
      case GO_SAVE_EVENT.LOAD:
      case GO_SAVE_EVENT.FORWARD:
      case GO_SAVE_EVENT.BACKWARD:
        restore(change.snapshot);
        break;
      case GO_SAVE_EVENT.CLEAR:
        restore(goGameData.cached);
        break;
    }
  }
  goSave.onListen(onSaveChange, onBeforeUnmount);
}
</script>

<template>
  <Chessboard
    :size="goSnapshot.size"
    :width="props.width"
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
