<script setup lang="ts">
import type { ChessPieceProps } from './chess-piece';

defineOptions({ name: 'ChessPiece' });
withDefaults(defineProps<ChessPieceProps>(), { preview: false });
</script>

<template>
  <span
    class="go-board__stone"
    :class="{
      'go-board__stone--black': sign === 1,
      'go-board__stone--white': sign === -1,
      'go-board__stone--preview': preview,
    }"
  />
</template>

<style scoped>
.go-board__stone {
  position: absolute;
  top: 8%;
  left: 8%;
  z-index: 1;
  box-sizing: border-box;
  width: 84%;
  height: 84%;
  border-radius: 50%;
}

.go-board__stone--black {
  background: radial-gradient(circle at 35% 30%, #555, #080808 68%);
  box-shadow: 1px 2px 3px rgb(0 0 0 / 35%);
}

.go-board__stone--white {
  background: radial-gradient(circle at 35% 30%, #fff, #d7d7d7 70%);
  border: 1px solid #999;
  box-shadow: 1px 2px 3px rgb(0 0 0 / 25%);
}

.go-board__stone--preview {
  opacity: 0.45;
}
</style>
