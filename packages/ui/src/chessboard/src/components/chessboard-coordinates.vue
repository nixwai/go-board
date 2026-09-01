<script setup lang="ts">
import { computed } from 'vue';

interface ChessboardCoordinatesProps {
  size: number
}

interface CoordinateLabel {
  value: string
  position: number
}

defineOptions({ name: 'ChessboardCoordinates' });

const props = defineProps<ChessboardCoordinatesProps>();

/** 围棋列坐标跳过字母 I，与棋盘网格和规则引擎保持一致。 */
const COLUMN_LABELS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ';

/** 生成与棋盘交叉点一一对应、从左到右递增的列坐标。 */
const columns = computed<CoordinateLabel[]>(() => Array.from(
  { length: props.size },
  (_, position) => ({ value: COLUMN_LABELS[position] ?? '', position }),
));
/** 生成与棋盘交叉点一一对应、从上到下递减的行坐标。 */
const rows = computed<CoordinateLabel[]>(() => Array.from(
  { length: props.size },
  (_, position) => ({ value: String(props.size - position), position }),
));

/** 棋盘内容使用固定边距，为左侧和下侧坐标及棋子渲染保留空间。 */
const GRID_INSET = 5;
/** 将棋盘索引转换为与网格交叉点一致的 SVG 坐标。 */
function toPosition(position: number): number {
  const drawableSize = 100 - (GRID_INSET * 2);
  return GRID_INSET + (((position + 0.5) / props.size) * drawableSize);
}
</script>

<template>
  <svg
    class="chessboard-coordinates"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <text
      v-for="row in rows"
      :key="`row-${row.position}`"
      class="chessboard-coordinate chessboard-coordinate-row-left"
      :x="GRID_INSET / 2"
      :y="toPosition(row.position)"
      text-anchor="middle"
    >{{ row.value }}</text>
    <text
      v-for="column in columns"
      :key="`column-${column.position}`"
      class="chessboard-coordinate chessboard-coordinate-column-bottom"
      :x="toPosition(column.position)"
      :y="100 - (GRID_INSET / 2)"
      text-anchor="middle"
    >{{ column.value }}</text>
  </svg>
</template>

<style>
.chessboard-coordinates {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  font-family: sans-serif;
  font-size: 3px;
  font-weight: 600;
  line-height: 1;
  pointer-events: none;
  fill: #5c421e;
}

.chessboard-coordinate {
  dominant-baseline: middle;
}
</style>
