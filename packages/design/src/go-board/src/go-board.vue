<script setup lang="ts">
import type { GoGameOptions } from '@go-board/tool';
import type {
  GoBoardExposed,
  GoBoardMoveEvent,
  GoBoardProps,
  GoBoardUpdateEvent,
} from './go-board';

import { GoGameData, normalizePosition } from '@go-board/tool';
import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { ref } from 'vue';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), {
  disabled: false,
  width: '100%',
});

const emit = defineEmits<{
  update: [payload: GoBoardUpdateEvent]
  move: [payload: GoBoardMoveEvent]
}>();

/** 由规则引擎维护对局状态，组件状态仅负责驱动视图。 */
const goGameData = new GoGameData(props.init);
const boardSize = ref(goGameData.size);
const rows = ref(goGameData.layout);
const player = ref(goGameData.player);
const hoverPosition = ref<string>();
const lastMovePosition = ref<string>();

/** 通知外部当前布局和下一手执棋方。 */
function emitUpdate() {
  emit('update', {
    layout: goGameData.layout,
    player: goGameData.player,
  });
}

/** 通知外部本次落子位置及落子后的棋盘快照。 */
function emitMove(position: string) {
  emit('move', {
    layout: goGameData.layout,
    player: goGameData.player,
    position,
  });
}

/** 将规则引擎状态同步到组件响应式状态。 */
function refresh() {
  boardSize.value = goGameData.size;
  rows.value = goGameData.layout;
  player.value = goGameData.player;
  hoverPosition.value = undefined;
}

/** 处理外部或单元点击触发的落子流程。 */
function play(position?: string): boolean {
  if (position?.trim()) {
    const normalizedPosition = normalizePosition(position);
    if (!normalizedPosition || !goGameData.play(normalizedPosition)) { return false; }
    lastMovePosition.value = normalizedPosition;
    emitMove(normalizedPosition);
  }
  emitUpdate();
  goGameData.rotate();
  refresh();
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
    :size="boardSize"
    :width="props.width"
    role="grid"
    :aria-rowcount="boardSize"
    :aria-colcount="boardSize"
    @mouseleave="clearHover"
  >
    <ChessGrid
      :rows="rows"
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
          :sign="player"
          preview
        />
      </template>
    </ChessGrid>
  </Chessboard>
</template>
