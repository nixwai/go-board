<script setup lang="ts">
import type { GoGameOptions } from '@go-board/tool';
import type { GoBoardEvent, GoBoardExposed, GoBoardProps } from './go-board';

import { GoGameData, normalizePosition } from '@go-board/tool';
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
const gameOptions = ref<Required<GoGameOptions>>(goGameData.snapshot);
const hoverPosition = ref<string>();
const lastMovePosition = ref<string>();

/** 创建包含当前对局快照和可选落子位置的事件数据。 */
function createEvent(position?: string): GoBoardEvent {
  return { ...goGameData.snapshot, position };
}

function emitUpdate(position?: string) {
  emit('update', createEvent(position));
}

/** 通知外部本次落子位置及落子后的棋盘快照。 */
function emitMove(position: string) {
  emit('move', createEvent(position));
}

/** 将规则引擎快照同步到组件响应式状态。 */
function refresh() {
  gameOptions.value = goGameData.snapshot;
  hoverPosition.value = undefined;
}

/** 处理外部或单元点击触发的落子流程。 */
function play(position?: string): boolean {
  let normalizedPosition: string | undefined;
  if (position?.trim()) {
    normalizedPosition = normalizePosition(position) ?? undefined;
    if (!normalizedPosition || !goGameData.play(normalizedPosition)) { return false; }
    lastMovePosition.value = normalizedPosition;
  }
  goGameData.rotate();
  refresh();
  if (normalizedPosition) {
    emitMove(normalizedPosition);
  }
  emitUpdate(normalizedPosition);
  return true;
}

/** 重置对局并同步更新后的棋盘状态。 */
function reset(options?: GoGameOptions): boolean {
  if (!goGameData.reset(options)) { return false; }
  lastMovePosition.value = undefined;
  refresh();
  emitUpdate();
  return true;
}

/** 仅在当前位置可合法落子时显示预览棋子。 */
function setHover(position: string) {
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
    :size="gameOptions.size"
    :width="props.width"
    role="grid"
    :aria-rowcount="gameOptions.size"
    :aria-colcount="gameOptions.size"
    @mouseleave="clearHover"
  >
    <ChessGrid
      :rows="gameOptions.layout"
      :disabled="props.disabled"
      @cell-mouseenter="setHover"
      @cell-click="play"
    >
      <template #default="{ sign, position }">
        <ChessPiece
          v-if="sign"
          :sign="sign"
          :marked="lastMovePosition === position"
        />
        <ChessPiece
          v-else-if="hoverPosition === position"
          :sign="gameOptions.player"
          preview
        />
      </template>
    </ChessGrid>
  </Chessboard>
</template>
