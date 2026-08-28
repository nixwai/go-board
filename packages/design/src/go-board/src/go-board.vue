<script setup lang="ts">
import type { GoGameOptions, GoGamePosition, GoGameSnapshot, GoVertex } from '@go-board/tool';
import type { GoBoardEvent, GoBoardExposed, GoBoardProps } from './go-board';

import { GoGameData, vertexEquals } from '@go-board/tool';
import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { ref } from 'vue';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), {
  disabled: false,
  width: '100%',
});

const emit = defineEmits<{
  update: [payload: GoBoardEvent]
  move: [payload: GoBoardEvent]
}>();

/** 由规则引擎维护对局状态，组件状态仅负责驱动视图。 */
const goGameData = new GoGameData(props.init);
const goSnapshot = ref<GoGameSnapshot>(goGameData.snapshot);
const hoverPosition = ref<GoVertex>();

/** 通知外部当前完整对局快照。 */
function emitUpdate() {
  emit('update', goGameData.snapshot);
}

/** 通知外部落子后的完整对局快照。 */
function emitMove() {
  emit('move', goGameData.snapshot);
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

/** 重置对局并同步更新后的棋盘状态。 */
function reset(options?: GoGameOptions): boolean {
  if (!goGameData.reset(options)) { return false; }
  refresh();
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
