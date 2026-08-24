<script setup lang="ts">
import { computed } from 'vue';

interface ChessboardLinesProps {
  size: number
}

defineOptions({ name: 'ChessboardLines' });
const props = defineProps<ChessboardLinesProps>();

/** 根据棋盘尺寸计算所有网格线的偏移量。 */
const lineOffsets = computed(() => {
  const boardSize = props.size;
  return Array.from({ length: boardSize }, (_, index) => ((index + 0.5) / boardSize) * 100);
});
</script>

<template>
  <svg
    class="chessboard-lines"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    fill="none"
    aria-hidden="true"
  >
    <line
      v-for="(offset, index) in lineOffsets"
      :key="`horizontal-${index}`"
      :x1="lineOffsets[0]"
      :x2="lineOffsets[lineOffsets.length - 1]"
      :y1="offset"
      :y2="offset"
    />
    <line
      v-for="(offset, index) in lineOffsets"
      :key="`vertical-${index}`"
      :x1="offset"
      :x2="offset"
      :y1="lineOffsets[0]"
      :y2="lineOffsets[lineOffsets.length - 1]"
    />
  </svg>
</template>

<style>
.chessboard-lines {
  position: absolute;
  inset: 1.5%;
  z-index: 0;
  display: block;
  width: calc(100% - 3%);
  height: calc(100% - 3%);
  overflow: visible;
  pointer-events: none;
  stroke: #5c421e;
  stroke-width: 0.25px;
  stroke-linecap: square;
  vector-effect: non-scaling-stroke;
}
</style>
