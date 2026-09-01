<script setup lang="ts">
import { computed } from 'vue';

interface ChessboardStarsProps {
  size: number
}

interface StarPoint {
  x: number
  y: number
}

defineOptions({ name: 'ChessboardStars' });
const props = defineProps<ChessboardStarsProps>();

const starPoints = computed<StarPoint[]>(() => {
  const size = props.size;
  const center = (size - 1) / 2;
  const offset = size >= 13 ? 3 : 2;
  const cornerPoints = [
    { x: offset, y: offset },
    { x: size - 1 - offset, y: offset },
    { x: offset, y: size - 1 - offset },
    { x: size - 1 - offset, y: size - 1 - offset },
  ];

  if (size < 9) {
    return size % 2 === 0 ? [] : [{ x: center, y: center }];
  }

  if (size < 13) {
    return size % 2 === 0 ? cornerPoints : [...cornerPoints, { x: center, y: center }];
  }

  if (size % 2 === 0) {
    return cornerPoints;
  }

  const anchors = [offset, center, size - 1 - offset];
  return anchors.flatMap(x => anchors.map(y => ({ x, y })));
});

function toPercent(position: number): number {
  return ((position + 0.5) / props.size) * 100;
}
</script>

<template>
  <svg
    class="chessboard-stars"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <circle
      v-for="point in starPoints"
      :key="`${point.x}-${point.y}`"
      :cx="toPercent(point.x)"
      :cy="toPercent(point.y)"
      r="0.5"
    />
  </svg>
</template>

<style>
.chessboard-stars {
  position: absolute;
  inset: 5%;
  z-index: 1;
  display: block;
  width: 90%;
  height: 90%;
  overflow: visible;
  pointer-events: none;
}

.chessboard-stars circle {
  fill: #5c421e;
}
</style>
