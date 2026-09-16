<script setup lang="ts">
import type { ChessInfluenceProps } from './chess-influence';

defineOptions({ name: 'ChessInfluence' });
defineProps<ChessInfluenceProps>();
</script>

<template>
  <span
    class="chess-influence-cube"
    :class="{
      'chess-influence-cube-black': sign === 1,
      'chess-influence-cube-white': sign === -1,
    }"
  />
</template>

<style>
.chess-influence-cube {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  box-sizing: border-box;
  width: 25%;
  height: 25%;
  border-radius: 1px;
  transform: translate(-50%, -50%);
}

.chess-influence-cube-black {
  background: linear-gradient(135deg, #555, #080808 70%);
  border: 1px solid #080808;
  box-shadow: 1px 2px 2px rgb(0 0 0 / 35%);
}

.chess-influence-cube-white {
  background: linear-gradient(135deg, #fff, #d7d7d7 70%);
  border: 1px solid #999;
  box-shadow: 1px 2px 2px rgb(0 0 0 / 25%);
}
</style>
