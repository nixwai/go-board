<script setup lang="ts">
import type { GoGameOptions, GoGamePosition, GoVertex } from '@go-board/tool';
import type { GoBoardEvent, GoBoardExposed, GoBoardProps } from './go-board';

import { GoGameData, normalizeVertex, vertexEquals } from '@go-board/tool';
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
const hoverPosition = ref<GoVertex>();
const lastMovePosition = ref<GoVertex>();

/** 复制顶点坐标，避免内部状态与事件暴露可变数组引用。 */
function cloneVertex(position?: GoVertex): GoVertex | undefined {
  return position ? [position[0], position[1]] : undefined;
}

/** 创建包含当前对局快照和可选落子位置的事件数据。 */
function createEvent(position?: GoVertex): GoBoardEvent {
  return {
    ...goGameData.snapshot,
    position: cloneVertex(position),
  };
}

function emitUpdate(position?: GoVertex) {
  emit('update', createEvent(position));
}

/** 通知外部本次落子位置及落子后的棋盘快照。 */
function emitMove(position: GoVertex) {
  emit('move', createEvent(position));
}

/** 将规则引擎快照同步到组件响应式状态。 */
function refresh() {
  gameOptions.value = goGameData.snapshot;
  hoverPosition.value = undefined;
}

/** 处理外部或单元点击触发的落子流程。 */
function play(position?: GoGamePosition): boolean {
  let vertex: GoVertex | undefined;
  if (position && (typeof position !== 'string' || position.trim())) {
    vertex = normalizeVertex(position, [goGameData.size, goGameData.size]) ?? undefined;
    if (!vertex || !goGameData.play(vertex)) { return false; }
    lastMovePosition.value = vertex;
  }

  goGameData.rotate();
  refresh();
  if (vertex) {
    emitMove(vertex);
  }
  emitUpdate(vertex);
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
          :marked="vertexEquals(position, lastMovePosition)"
        />
        <ChessPiece
          v-else-if="vertexEquals(position, hoverPosition)"
          :sign="gameOptions.player"
          preview
        />
      </template>
    </ChessGrid>
  </Chessboard>
</template>
