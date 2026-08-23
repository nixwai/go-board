<script setup lang="ts">
import type { GoGameOptions } from '@go-board/tool';
import type {
  GoBoardExposed,
  GoBoardMoveEvent,
  GoBoardProps,
  GoBoardUpdateEvent,
} from './go-board';
import { GoGame } from '@go-board/tool';
import { ref } from 'vue';
import ChessGrid from '../../chess-grid/src/chess-grid.vue';
import ChessPiece from '../../chess-piece/src/chess-piece.vue';
import Chessboard from '../../chessboard/src/chessboard.vue';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), { width: '100%' });

const emit = defineEmits<{
  update: [payload: GoBoardUpdateEvent]
  move: [payload: GoBoardMoveEvent]
}>();

/** 由规则引擎维护对局状态，组件状态仅负责驱动视图。 */
const goGame = new GoGame(props.init);
const boardSize = ref(goGame.size);
const rows = ref(goGame.layout);
const player = ref(goGame.player);
const hoverPosition = ref<string>();

/** 通知外部当前布局和下一手执棋方。 */
function emitUpdate() {
  emit('update', {
    layout: goGame.layout,
    player: goGame.player,
  });
}

/** 通知外部本次落子位置及落子后的棋盘快照。 */
function emitMove(position: string) {
  emit('move', {
    layout: goGame.layout,
    player: goGame.player,
    position,
  });
}

/** 将规则引擎状态同步到组件响应式状态。 */
function refresh() {
  boardSize.value = goGame.size;
  rows.value = goGame.layout;
  player.value = goGame.player;
  hoverPosition.value = undefined;
}

/** 处理外部或单元点击触发的落子流程。 */
function play(position?: string): boolean {
  if (position?.trim()) {
    if (!goGame.play(position)) { return false; }
    emitMove(position);
  }
  emitUpdate();
  goGame.rotate();
  refresh();
  return true;
}

/** 重置对局并同步更新后的棋盘状态。 */
function reset(options?: GoGameOptions): boolean {
  if (!goGame.reset(options)) { return false; }
  refresh();
  emitUpdate();
  return true;
}

/** 仅在当前位置可合法落子时显示预览棋子。 */
function setHover(position: string) {
  hoverPosition.value = goGame.isLegal(position) ? position : undefined;
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
      @cell-mouseenter="setHover"
      @cell-click="play"
    >
      <template #default="{ sign, position }">
        <ChessPiece
          v-if="sign"
          :sign="sign"
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
