<script setup lang="ts">
import type { ChessboardProps } from './chessboard';
import { computed, useAttrs } from 'vue';

defineOptions({ name: 'Chessboard', inheritAttrs: false });
const props = withDefaults(defineProps<ChessboardProps>(), { width: '100%' });
/** 将透传属性显式绑定到棋盘容器根节点。 */
const attrs = useAttrs();

/** 将公开的宽度属性转换为可直接用于样式的 CSS 值。 */
const boardStyle = computed(() => ({ width: normalizeWidth(props.width) }));

/** 规范化数字或字符串形式的棋盘宽度。 */
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
    <slot />
  </div>
</template>

<style scoped>
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
