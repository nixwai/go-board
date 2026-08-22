<script setup lang="ts">
import type { GoGameOptions } from '../../utils/go-game';
import type {
  GoBoardExposed,
  GoBoardMoveEvent,
  GoBoardProps,
  GoBoardUpdateEvent,
} from './go-board';
import { ref } from 'vue';
import ChessGrid from '../../chess-grid/src/chess-grid.vue';
import ChessPiece from '../../chess-piece/src/chess-piece.vue';
import Chessboard from '../../chessboard/src/chessboard.vue';
import { GoGame } from '../../utils/go-game';

defineOptions({ name: 'GoBoard' });

const props = withDefaults(defineProps<GoBoardProps>(), { width: '100%' });

const emit = defineEmits<{
  update: [payload: GoBoardUpdateEvent]
  move: [payload: GoBoardMoveEvent]
}>();

const goGame = new GoGame(props.init);
const boardSize = ref(goGame.size);
const rows = ref(goGame.layout);
const player = ref(goGame.player);
const hoverPosition = ref<string>();

function emitUpdate() {
  emit('update', {
    layout: goGame.layout,
    player: goGame.player,
  });
}

function emitMove(position: string) {
  emit('move', {
    layout: goGame.layout,
    player: goGame.player,
    position,
  });
}

function refresh() {
  boardSize.value = goGame.size;
  rows.value = goGame.layout;
  player.value = goGame.player;
  hoverPosition.value = undefined;
}

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

function reset(options?: GoGameOptions): boolean {
  if (!goGame.reset(options)) { return false; }
  refresh();
  emitUpdate();
  return true;
}

function setHover(position: string) {
  hoverPosition.value = goGame.isLegal(position) ? position : undefined;
}

function clearHover() {
  hoverPosition.value = undefined;
}

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
