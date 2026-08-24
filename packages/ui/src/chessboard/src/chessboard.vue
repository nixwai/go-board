<script setup lang="ts">
import type { ChessboardProps } from './chessboard';
import { computed, useAttrs } from 'vue';
import ChessboardLines from './components/chessboard-lines.vue';
import ChessboardStars from './components/chessboard-stars.vue';

defineOptions({ name: 'Chessboard', inheritAttrs: false });
const props = withDefaults(defineProps<ChessboardProps>(), { width: '100%' });
const attrs = useAttrs();

/** 用于网格线计数和位置计算的棋盘尺寸。 */
const size = computed(() => normalizeSize(props.size));
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
    <ChessboardLines :size="size" />
    <ChessboardStars :size="size" />
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
</style>
