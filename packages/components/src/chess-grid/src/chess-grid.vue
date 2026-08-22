<script setup lang="ts">
import type { ChessGridProps, ChessGridSlotProps } from './chess-grid';
import { computed, useAttrs } from 'vue';

defineOptions({ name: 'ChessGrid', inheritAttrs: false });
const props = defineProps<ChessGridProps>();
const emit = defineEmits<{
  cellMouseenter: [position: string]
  cellClick: [position: string]
}>();
defineSlots<{
  default: (props: ChessGridSlotProps) => unknown
}>();

const attrs = useAttrs();

const COLUMN_LABELS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
const rows = computed(() => props.rows.map(row => [...row]));
const size = computed(() => rows.value.length);

function getPosition(x: number, y: number): string {
  return `${COLUMN_LABELS[x]}${size.value - y}`;
}

function handleMouseenter(x: number, y: number) {
  emit('cellMouseenter', getPosition(x, y));
}

function handleClick(x: number, y: number) {
  emit('cellClick', getPosition(x, y));
}
</script>

<template>
  <div v-bind="attrs" class="chess-grid" role="presentation">
    <template v-for="(row, y) in rows" :key="`row-${y}`">
      <button
        v-for="(sign, x) in row"
        :key="`${x}-${y}`"
        class="go-board__cell"
        type="button"
        role="gridcell"
        :aria-label="getPosition(x, y)"
        :aria-pressed="sign !== 0"
        @mouseenter="handleMouseenter(x, y)"
        @click="handleClick(x, y)"
      >
        <slot :sign="sign" :position="getPosition(x, y)" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.chess-grid {
  display: grid;
  grid-template-columns: repeat(v-bind('size'), minmax(0, 1fr));
  width: 100%;
  height: 100%;
}

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
</style>
