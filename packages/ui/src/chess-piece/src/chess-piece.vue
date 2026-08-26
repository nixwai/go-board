<script setup lang="ts">
import type { ChessPieceProps } from './chess-piece';

defineOptions({ name: 'ChessPiece' });
/** 为预览状态提供默认值，普通棋子默认完整显示。 */
withDefaults(defineProps<ChessPieceProps>(), { marked: false, preview: false });
</script>

<template>
  <span
    class="chess-piece-stone"
    :class="{
      'chess-piece-stone-black': sign === 1,
      'chess-piece-stone-white': sign === -1,
      'chess-piece-stone-preview': preview,
      'chess-piece-stone-marked': marked,
    }"
  />
</template>

<style>
.chess-piece-stone {
  position: absolute;
  top: 8%;
  left: 8%;
  z-index: 1;
  box-sizing: border-box;
  width: 84%;
  height: 84%;
  border-radius: 50%;
}

.chess-piece-stone-black {
  --chess-piece-marker-color: #fff;

  background: radial-gradient(circle at 35% 30%, #555, #080808 68%);
  box-shadow: 1px 2px 3px rgb(0 0 0 / 35%);
}

.chess-piece-stone-white {
  --chess-piece-marker-color: #000;

  background: radial-gradient(circle at 35% 30%, #fff, #d7d7d7 70%);
  border: 1px solid #999;
  box-shadow: 1px 2px 3px rgb(0 0 0 / 25%);
}

.chess-piece-stone-preview {
  opacity: 0.45;
}

.chess-piece-stone-marked::after {
  position: absolute;
  top: 50%;
  left: 50%;
  box-sizing: border-box;
  width: 40%;
  height: 40%;
  content: '';
  border: 2px solid var(--chess-piece-marker-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>
