<script setup lang="ts">
import type { ChessGridProps, ChessGridSlotProps } from './chess-grid';
import { computed, useAttrs } from 'vue';

defineOptions({ name: 'ChessGrid', inheritAttrs: false });
const props = defineProps<ChessGridProps>();
const emit = defineEmits<{
  /** 鼠标进入棋盘单元时通知当前坐标。 */
  cellMouseenter: [position: string]
  /** 点击棋盘单元时通知当前坐标。 */
  cellClick: [position: string]
}>();
defineSlots<{
  /** 渲染单元内容时提供棋子标记和棋盘坐标。 */
  default: (props: ChessGridSlotProps) => unknown
}>();

/** 将透传属性显式绑定到稳定的根节点。 */
const attrs = useAttrs();

/** 跳过字母 I 的棋盘列标签。 */
const COLUMN_LABELS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';
/** 复制输入行，避免内部渲染依赖调用方数组的后续变更。 */
const rows = computed(() => props.rows.map(row => [...row]));
/** 当前棋盘的边长，用于计算坐标和网格列数。 */
const size = computed(() => rows.value.length);

/** 将二维数组索引转换为围棋坐标。 */
function getPosition(x: number, y: number): string {
  return `${COLUMN_LABELS[x]}${size.value - y}`;
}

/** 转发单元鼠标进入事件，并附带标准化棋盘坐标。 */
function handleMouseenter(x: number, y: number) {
  if (props.disabled) { return; }
  emit('cellMouseenter', getPosition(x, y));
}

/** 转发单元点击事件，并附带标准化棋盘坐标。 */
function handleClick(x: number, y: number) {
  if (props.disabled) { return; }
  emit('cellClick', getPosition(x, y));
}
</script>

<template>
  <div v-bind="attrs" class="chess-grid" role="presentation">
    <template v-for="(row, y) in rows" :key="`row-${y}`">
      <button
        v-for="(sign, x) in row"
        :key="`${x}-${y}`"
        class="chess-grid-cell"
        type="button"
        role="gridcell"
        :disabled="props.disabled"
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

<style>
.chess-grid {
  position: absolute;
  inset: 1.5%;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(v-bind('size'), minmax(0, 1fr));
  width: calc(100% - 3%);
  height: calc(100% - 3%);
}

.chess-grid-cell {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}
</style>
