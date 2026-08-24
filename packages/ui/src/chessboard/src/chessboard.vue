<script setup lang="ts">
import type { ChessboardProps } from './chessboard';
import { computed, useAttrs } from 'vue';

defineOptions({ name: 'Chessboard', inheritAttrs: false });
const props = withDefaults(defineProps<ChessboardProps>(), { width: '100%' });
const attrs = useAttrs();

/** 用于网格线计数和位置计算的棋盘尺寸。 */
const size = computed(() => normalizeSize(props.size));
/** 根据棋盘尺寸预计算所有网格线的偏移量。 */
const lineOffsets = computed(() => {
  const boardSize = size.value;
  return Array.from({ length: boardSize }, (_, index) => ((index + 0.5) / boardSize) * 100);
});
/** 将公开宽度属性转换为 CSS 值。 */
const boardStyle = computed(() => ({ width: normalizeWidth(props.width) }));

/** 标准化数字或字符串形式的棋盘尺寸。 */
function normalizeSize(value: number | string): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : 1;
  }

  const parsedValue = Number(value.trim());
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

/** 标准化数字或字符串形式的棋盘宽度。 */
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
    class="chessboard"
    :style="boardStyle"
  >
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
    <slot />
  </div>
</template>

<style>
.chessboard {
  position: relative;
  box-sizing: border-box;
  aspect-ratio: 1;
  padding: 1.5%;
  overflow: hidden;
  background: #dcb35c;
  border: 1px solid #a77b2f;
  border-radius: 2px;
}

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
