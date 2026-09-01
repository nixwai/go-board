<script setup lang="ts">
import type {
  GoBoardInstance,
  GoGameOptions,
  GoGameSnapshot,
} from '@go-board/design';

import {
  GoBoard,
  GoHistoryButton,
  GoHistorySlider,
  GoSave,
  normalizePosition,
} from '@go-board/design';
import { computed, ref } from 'vue';

const boardRef = ref<GoBoardInstance>();
const history = ref<GoGameOptions[]>([]);
const snapshot = ref<GoGameSnapshot>();

const init: GoGameOptions = {
  size: 9,
  player: 1,
};

const playerLabel = computed(() => snapshot.value?.player === -1 ? '白方' : '黑方');
const latestVertexLabel = computed(() => {
  const current = snapshot.value;
  if (!current?.latestVertex) { return '暂无'; }
  return normalizePosition(current.latestVertex, Number(current.size)) ?? '暂无';
});

function playAtD4() {
  boardRef.value?.play('D4');
}

function pass() {
  boardRef.value?.play();
}

function handleUpdate(event: GoGameSnapshot) {
  snapshot.value = event;
}
</script>

<template>
  <main class="playground-page">
    <section class="demo-card" aria-labelledby="demo-title">
      <header class="demo-header">
        <div>
          <p class="eyebrow">
            @go-board/design
          </p>
          <h1 id="demo-title">
            围棋组件示例
          </h1>
          <p class="description">
            棋盘、存档、历史控制按钮与滑动条组合使用。
          </p>
        </div>

        <dl class="game-status" aria-label="当前棋局状态">
          <div>
            <dt>下一手</dt>
            <dd>{{ playerLabel }}</dd>
          </div>
          <div>
            <dt>最新落子</dt>
            <dd>{{ latestVertexLabel }}</dd>
          </div>
          <div>
            <dt>存档数量</dt>
            <dd>{{ history.length }}</dd>
          </div>
        </dl>
      </header>

      <GoSave v-model:value="history">
        <div class="board-panel">
          <GoBoard
            ref="boardRef"
            class="board"
            :width="480"
            :init="init"
            show-coord
            aria-label="九路围棋棋盘"
            @update="handleUpdate"
          />

          <div class="history-panel">
            <span id="history-label">棋局历史</span>
            <GoHistorySlider aria-labelledby="history-label" />
          </div>
        </div>

        <div class="controls" aria-label="棋局控制">
          <button type="button" @click="playAtD4">
            落子 D4
          </button>
          <button type="button" @click="pass">
            停一手
          </button>
          <GoHistoryButton :step="-1">
            后退
          </GoHistoryButton>
          <GoHistoryButton :step="1">
            前进
          </GoHistoryButton>
          <GoHistoryButton :step="0">
            重置棋盘
          </GoHistoryButton>
        </div>
      </GoSave>
    </section>
  </main>
</template>

<style scoped>
.playground-page {
  min-height: 100vh;
  padding: 48px 24px;
  color: #252018;
  background:
    radial-gradient(circle at top left, rgb(205 230 211 / 70%), transparent 36%),
    linear-gradient(145deg, #f7f1e5, #e9dfca);
}

.demo-card {
  width: min(100%, 960px);
  padding: 32px;
  margin: 0 auto;
  background: rgb(255 253 247 / 88%);
  border: 1px solid rgb(83 68 45 / 16%);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgb(69 55 35 / 16%);
  backdrop-filter: blur(16px);
}

.demo-header {
  display: flex;
  gap: 32px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 700;
  color: #55705a;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

h1 {
  margin: 0;
  font-size: clamp(30px, 5vw, 48px);
  line-height: 1.1;
}

.description {
  margin: 12px 0 0;
  color: #6b6256;
}

.game-status {
  display: grid;
  grid-template-columns: repeat(3, minmax(84px, 1fr));
  gap: 12px;
  min-width: 320px;
  margin: 0;
}

.game-status div {
  padding: 12px 14px;
  background: #f4efe5;
  border-radius: 14px;
}

.game-status dt {
  font-size: 12px;
  color: #786f62;
}

.game-status dd {
  margin: 4px 0 0;
  font-size: 18px;
  font-weight: 700;
}

.board-panel {
  display: grid;
  gap: 20px;
  justify-items: center;
}

.board {
  max-width: 100%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 14px 36px rgb(56 42 23 / 22%);
}

.history-panel {
  display: grid;
  grid-template-columns: auto minmax(160px, 480px);
  gap: 16px;
  align-items: center;
  width: min(100%, 560px);
  font-size: 14px;
  font-weight: 600;
  color: #4f493f;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}

button {
  min-height: 42px;
  padding: 0 18px;
  font: inherit;
  font-weight: 650;
  color: #fff;
  cursor: pointer;
  background: #3f5f47;
  border: 0;
  border-radius: 999px;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    opacity 160ms ease;
}

button:focus-visible {
  outline: 3px solid rgb(63 95 71 / 35%);
  outline-offset: 3px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

button:hover:not(:disabled) {
  background: #2f4d37;
  transform: translateY(-1px);
}

@media (width <= 720px) {
  .playground-page {
    padding: 20px 12px;
  }

  .demo-card {
    padding: 20px;
    border-radius: 18px;
  }

  .demo-header {
    flex-direction: column;
    align-items: stretch;
  }

  .game-status {
    min-width: 0;
  }

  .history-panel {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
