<script setup lang="ts">
import type { ChessboardProps } from './chessboard';
import { computed, useAttrs } from 'vue';

defineOptions({ name: 'Chessboard', inheritAttrs: false });
const props = withDefaults(defineProps<ChessboardProps>(), { width: '100%' });
const attrs = useAttrs();

const boardStyle = computed(() => ({ width: normalizeWidth(props.width) }));

function normalizeWidth(value: number | string): string {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? `${value}px` : '100%';
  }

  return value.trim() || '100%';
}
</script>

<template>
  <div
    v-bind="attrs"
    class="go-board"
    :style="boardStyle"
  >
    <slot />
  </div>
</template>

<style scoped>
.go-board {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(v-bind('props.size'), minmax(0, 1fr));
  aspect-ratio: 1;
  padding: 1.5%;
  overflow: hidden;
  background: #dcb35c;
  border: 1px solid #a77b2f;
  border-radius: 2px;
}
</style>
