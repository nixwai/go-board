<script setup lang="ts">
import type { GoSliderProps } from './go-slider';

import { computed, inject, onBeforeUnmount, ref, useAttrs } from 'vue';
import { GO_SAVE_INJECTION } from '../../go-save/src/keys';

defineOptions({
  name: 'GoSlider',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<GoSliderProps>(), { disabled: false });
const attrs = useAttrs();
const goSave = inject(GO_SAVE_INJECTION);
const current = ref(-1);
const length = ref(0);

const minimum = computed(() => length.value > 0 ? 0 : -1);
const maximum = computed(() => length.value - 1);
const isDisabled = computed(() => props.disabled || !goSave || length.value === 0);

/** 根据存档事件同步滑动范围和当前历史位置。 */
goSave?.onListen((change) => {
  current.value = change.current;
  length.value = change.length;
}, onBeforeUnmount);

/** 将滑动输入值映射为 GoSave 的历史快照位置。 */
function loadSnapshot(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  goSave?.load(Number(input.value));
}
</script>

<template>
  <input
    v-bind="attrs"
    class="go-slider"
    type="range"
    step="1"
    :min="minimum"
    :max="maximum"
    :value="current"
    :disabled="isDisabled"
    @input="loadSnapshot"
  >
</template>

<style scoped>
.go-slider {
  width: 100%;
  margin: 0;
}

.go-slider:not(:disabled) {
  cursor: pointer;
}

.go-slider:disabled {
  cursor: not-allowed;
}
</style>
