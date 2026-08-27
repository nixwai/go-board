<script setup lang="ts">
import type {
  GoBoardEvent,
  GoBoardInstance,
} from '@go-board/design';
import type { GoGameOptions } from '@go-board/tool';

import { GoBoard } from '@go-board/design';
import { ref } from 'vue';

const boardRef = ref<GoBoardInstance>();

const init: GoGameOptions = {
  size: 9,
  player: 1,
};

function playAtD4() {
  boardRef.value?.play('D4');
}

function pass() {
  boardRef.value?.play();
}

function resetBoard() {
  boardRef.value?.reset();
}

function handleMove(event: GoBoardEvent) {
  console.warn('落子位置：', event.position);
  console.warn('落子后的棋盘：', event.layout);
  console.warn('事件发出时的执棋方：', event.player);
}

function handleUpdate(event: GoBoardEvent) {
  console.warn('棋盘已更新：', event.layout, event.player);
}
</script>

<template>
  <div>
    <GoBoard
      ref="boardRef"
      :width="480"
      :init="init"
      aria-label="围棋棋盘"
      @move="handleMove"
      @update="handleUpdate"
    />

    <button type="button" @click="playAtD4">
      落子 D4
    </button>
    <button type="button" @click="pass">
      停一手
    </button>
    <button type="button" @click="resetBoard">
      重置
    </button>
  </div>
</template>
