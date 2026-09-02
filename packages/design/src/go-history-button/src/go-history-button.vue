<script setup lang="ts">
import type { GoHistoryButtonProps } from './go-history-button';

import { computed, useAttrs } from 'vue';
import { useGoSave } from '../../composables/use-go-save';

defineOptions({
  name: 'GoHistoryButton',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<GoHistoryButtonProps>(), {
  disabled: false,
  step: -1,
});

defineSlots<{
  /** 自定义按钮内容。 */
  default?: () => unknown
}>();

const attrs = useAttrs();

const { current, goSave, length } = useGoSave();

const normalizedStep = computed(() => Number.isInteger(props.step) ? props.step : undefined);

const defaultLabel = computed(() => {
  const step = normalizedStep.value;
  if (step === undefined) { return '历史'; }
  if (step > 0) { return '前进'; }
  if (step < 0) { return '后退'; }
  return '清空';
});

const isDisabled = computed(() => {
  if (props.disabled || !goSave || normalizedStep.value === undefined || length.value === 0) {
    return true;
  }

  if (normalizedStep.value === 0) { return false; }

  const target = current.value + normalizedStep.value;
  return target < 0 || target >= length.value;
});

/** 按有符号步数控制历史记录前进或后退。 */
function changeHistory() {
  const step = normalizedStep.value;
  if (isDisabled.value || step === undefined) { return; }
  // 清空历史
  if (step === 0) {
    goSave?.clear();
    return;
  }
  // 前进
  if (step > 0) {
    goSave?.forward(step);
    return;
  }
  // 后退
  goSave?.backward(Math.abs(step));
}
</script>

<template>
  <button
    v-bind="attrs"
    class="go-history-button"
    type="button"
    :disabled="isDisabled"
    @click="changeHistory"
  >
    <slot>{{ defaultLabel }}</slot>
  </button>
</template>

<style scoped>
.go-history-button:not(:disabled) {
  cursor: pointer;
}

.go-history-button:disabled {
  cursor: not-allowed;
}
</style>
