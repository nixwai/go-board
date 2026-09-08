<script setup lang="ts">
import type { GoHistorySliderProps } from './go-history-slider';

import { computed, useAttrs } from 'vue';
import { useGoSave } from '../../composables/use-go-save';

defineOptions({
  name: 'GoHistorySlider',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<GoHistorySliderProps>(), { disabled: false });
const attrs = useAttrs();
const {
  current,
  snapshotLen,
  loadSnapshot,
} = useGoSave();

const minimum = computed(() => snapshotLen.value > 0 ? 0 : -1);
const maximum = computed(() => snapshotLen.value - 1);
const isDisabled = computed(() => props.disabled || !snapshotLen);

/** 将滑动输入值映射为 GoSave 的历史快照位置。 */
function handleInput(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  loadSnapshot(Number(input.value));
}
</script>

<template>
  <input
    v-bind="attrs"
    class="go-history-slider"
    type="range"
    step="1"
    :min="minimum"
    :max="maximum"
    :value="current"
    :disabled="isDisabled"
    @input="handleInput"
  >
</template>

<style scoped>
.go-history-slider {
  width: 100%;
  margin: 0;
}

.go-history-slider:not(:disabled) {
  cursor: pointer;
}

.go-history-slider:disabled {
  cursor: not-allowed;
}
</style>
