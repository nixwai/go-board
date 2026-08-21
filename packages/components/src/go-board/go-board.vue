<script setup lang="ts">
import type { SignMap, Vertex } from '@sabaki/go-board';
import type {
  GoBoardExposed,
  GoBoardInit,
  GoBoardMoveEvent,
  GoBoardProps,
  GoBoardUpdateEvent,
  GoLayout,
  GoSign,
} from './go-board';
import GoBoardData from '@sabaki/go-board';
import { computed, ref, shallowRef } from 'vue';
import Chessboard from '../chessboard/chessboard.vue';

defineOptions({ name: 'GoBoard' });
const props = withDefaults(defineProps<GoBoardProps>(), {
  size: 19,
  width: '100%',
});
const emit = defineEmits<{
  update: [payload: GoBoardUpdateEvent]
  move: [payload: GoBoardMoveEvent]
}>();
const DEFAULT_SIZE = 19;
const MIN_SIZE = 1;
const MAX_SIZE = 25;
const COLUMN_LABELS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
const BLACK: Exclude<GoSign, 0> = 1;

const boardSize = normalizeChessboardSize(props.size);
let initialState = createInitialState(boardSize, props.init);
const board = shallowRef(initialState.board.clone());
const next = ref(initialState.next);
const hoverPosition = ref<string>();

const rows = computed(() => board.value.signMap.map(row => [...row]));

type BoardData = InstanceType<typeof GoBoardData>;
type PlayerSign = Exclude<GoSign, 0>;

function normalizeChessboardSize(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) { return DEFAULT_SIZE; }
  return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.trunc(parsed)));
}

function normalizeNext(value: GoSign | undefined): PlayerSign {
  return value === -1 ? -1 : BLACK;
}

function cloneLayout(layout: GoLayout): GoLayout {
  return layout.map(row => [...row]);
}

function createEmptyLayout(size: number): GoLayout {
  return Array.from({ length: size }, () => Array<GoSign>(size).fill(0));
}

function isValidLayout(layout: GoLayout | undefined, size: number): layout is GoLayout {
  if (!Array.isArray(layout) || layout.length !== size) { return false; }
  if (layout.some(row => !Array.isArray(row) || row.length !== size)) { return false; }
  return layout.every(row => row.every(sign => sign === -1 || sign === 0 || sign === 1));
}

function createInitialState(size: number, init?: GoBoardInit): { board: BoardData, next: PlayerSign } {
  if (!init || !isValidLayout(init.layout, size)) {
    return {
      board: new GoBoardData(createEmptyLayout(size) as SignMap),
      next: BLACK,
    };
  }

  const candidate = new GoBoardData(cloneLayout(init.layout) as SignMap);
  if (!candidate.isValid()) {
    return {
      board: new GoBoardData(createEmptyLayout(size) as SignMap),
      next: BLACK,
    };
  }

  return { board: candidate, next: normalizeNext(init.next) };
}

function getSnapshot(): GoLayout {
  return cloneLayout(board.value.signMap as GoLayout);
}

function emitUpdate(): void {
  emit('update', {
    layout: getSnapshot(),
    next: next.value,
  });
}

function normalizePosition(position: string): string | null {
  const normalized = position.trim().toUpperCase();
  const match = /^([A-HJ-Z])(\d+)$/.exec(normalized);
  if (!match) { return null; }

  const row = Number(match[2]);
  if (!Number.isInteger(row) || row < 1 || row > boardSize) { return null; }
  return `${match[1]}${row}`;
}

function toVertex(position: string): Vertex | null {
  const normalized = normalizePosition(position);
  if (!normalized) { return null; }

  const vertex = board.value.parseVertex(normalized);
  return board.value.has(vertex) ? vertex : null;
}

function isLegalVertex(vertex: Vertex): boolean {
  if (board.value.get(vertex) !== 0) { return false; }
  const analysis = board.value.analyzeMove(next.value, vertex);
  return !analysis.pass && !analysis.overwrite && !analysis.suicide;
}

function play(position?: string): boolean {
  if (!position?.trim()) {
    next.value = -next.value as PlayerSign;
    hoverPosition.value = undefined;
    emitUpdate();
    return true;
  }

  const normalized = normalizePosition(position);
  const vertex = toVertex(position);
  if (!normalized || !vertex || !isLegalVertex(vertex)) { return false; }

  try {
    board.value = board.value.makeMove(next.value, vertex, {
      preventOverwrite: true,
      preventSuicide: true,
    });
  }
  catch {
    return false;
  }

  next.value = -next.value as PlayerSign;
  hoverPosition.value = undefined;
  emit('update', {
    layout: getSnapshot(),
    next: next.value,
  });
  emit('move', {
    layout: getSnapshot(),
    next: next.value,
    position: normalized,
  });
  return true;
}

function reset(init?: GoBoardInit): boolean {
  if (init !== undefined) {
    if (!isValidLayout(init.layout, boardSize)) { return false; }

    const candidate = new GoBoardData(cloneLayout(init.layout) as SignMap);
    if (!candidate.isValid()) { return false; }
    initialState = { board: candidate, next: normalizeNext(init.next) };
  }

  board.value = initialState.board.clone();
  next.value = initialState.next;
  hoverPosition.value = undefined;
  emitUpdate();
  return true;
}

function setHover(position: string): void {
  const vertex = toVertex(position);
  hoverPosition.value = vertex && isLegalVertex(vertex) ? position : undefined;
}

function clearHover(): void {
  hoverPosition.value = undefined;
}

function isPreview(position: string, sign: GoSign): boolean {
  return sign === 0 && hoverPosition.value === position;
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
    <template v-for="(row, y) in rows" :key="`row-${y}`">
      <button
        v-for="(sign, x) in row"
        :key="`${x}-${y}`"
        class="go-board__cell"
        type="button"
        role="gridcell"
        :aria-label="`${COLUMN_LABELS[x]}${boardSize - y}`"
        :aria-pressed="sign !== 0"
        @mouseenter="setHover(`${COLUMN_LABELS[x]}${boardSize - y}`)"
        @click="play(`${COLUMN_LABELS[x]}${boardSize - y}`)"
      >
        <span
          v-if="sign !== 0 || isPreview(`${COLUMN_LABELS[x]}${boardSize - y}`, sign)"
          class="go-board__stone"
          :class="{
            'go-board__stone--black': sign === 1 || isPreview(`${COLUMN_LABELS[x]}${boardSize - y}`, sign) && next === 1,
            'go-board__stone--white': sign === -1 || isPreview(`${COLUMN_LABELS[x]}${boardSize - y}`, sign) && next === -1,
            'go-board__stone--preview': isPreview(`${COLUMN_LABELS[x]}${boardSize - y}`, sign),
          }"
        />
      </button>
    </template>
  </Chessboard>
</template>

<style scoped>
.go-board__cell {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.go-board__cell::before,
.go-board__cell::after {
  position: absolute;
  z-index: 0;
  display: block;
  content: '';
  background: #5c421e;
}

.go-board__cell::before {
  top: 50%;
  right: 0;
  left: 0;
  height: 1px;
  transform: translateY(-50%);
}

.go-board__cell::after {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
}

.go-board__stone {
  position: absolute;
  top: 8%;
  left: 8%;
  z-index: 1;
  box-sizing: border-box;
  width: 84%;
  height: 84%;
  border-radius: 50%;
}

.go-board__stone--black {
  background: radial-gradient(circle at 35% 30%, #555, #080808 68%);
  box-shadow: 1px 2px 3px rgb(0 0 0 / 35%);
}

.go-board__stone--white {
  background: radial-gradient(circle at 35% 30%, #fff, #d7d7d7 70%);
  border: 1px solid #999;
  box-shadow: 1px 2px 3px rgb(0 0 0 / 25%);
}

.go-board__stone--preview {
  opacity: 0.45;
}
</style>
