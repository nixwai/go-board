<script setup lang="ts">
import type { GoGameOptions } from '@go-board/tool';
import type { GoSaveChange, GoSaveChangeListener, GoSaveContext, GoSaveExposed, GoSaveOnBeforeMount, GoSaveProps } from './go-save';

import { GoHistoryData } from '@go-board/tool';
import { provide, shallowRef, toRaw, watch } from 'vue';
import { GO_SAVE_EVENT, GO_SAVE_INJECTION } from './keys';

defineOptions({ name: 'GoSave' });

const props = defineProps<GoSaveProps>();
const emit = defineEmits<{
  /** 历史快照列表变化时同步受控值。 */
  'update:value': [value: GoGameOptions[]]
}>();

defineSlots<{
  /** 存档上下文的默认内容插槽，不传递作用域参数。 */
  default: () => unknown
}>();

/** GoHistoryData 负责隔离历史数组，快照对象本身仍由调用方决定是否复制。 */
let goHistoryData = new GoHistoryData(toRaw(props.value ?? []));
let pendingValue: GoGameOptions[] | undefined;
const version = shallowRef(0);
const listeners: GoSaveChangeListener[] = [];

/** 创建当前历史状态事件；事件列表只做浅拷贝，不深拷贝快照对象。 */
function createChange(key: GoSaveChange['key']): GoSaveChange {
  return {
    key,
    current: goHistoryData.current,
    length: goHistoryData.length,
    snapshot: goHistoryData.snapshot,
    snapshots: goHistoryData.snapshots.slice(),
  };
}

/** 通知全部监听方当前历史发生变化。 */
function notify(change: GoSaveChange) {
  listeners.slice().forEach(listener => listener(change));
}

/** 重建历史数据实例，并通知已有监听方。 */
function rebuildHistory(value?: GoGameOptions[]) {
  goHistoryData = new GoHistoryData(toRaw(value ?? []));
  version.value += 1;
  notify(createChange(GO_SAVE_EVENT.REBUILD));
}

/** 接收外部双向绑定值变化，并重建历史数据实例。 */
watch(
  () => props.value,
  (value) => {
    const rawValue = value ? toRaw(value) : undefined;
    if (pendingValue && rawValue === pendingValue) {
      pendingValue = undefined;
      return;
    }

    rebuildHistory(value);
  },
);

/** 触发响应式属性更新；历史类本身仍负责保存真实数据。 */
function refresh() {
  version.value += 1;
}

/** 将历史快照列表同步给使用 v-model:value 的调用方。 */
function emitValue() {
  const value = goHistoryData.snapshots.slice();
  pendingValue = value;
  emit('update:value', value);
}

/** 同步当前历史状态，并通知监听方数据发生变化。 */
function syncChange(key: GoSaveChange['key']) {
  refresh();
  emitValue();
  notify(createChange(key));
}

/** 注册历史变化监听，并立即补发初始化或最近一次重建事件。 */
function onListen(
  listener: GoSaveChangeListener,
  onBeforeMount: GoSaveOnBeforeMount,
): () => void {
  const registeredListener: GoSaveChangeListener = change => listener(change);
  listeners.push(registeredListener);
  let registered = true;
  const unregister = () => {
    if (!registered) { return; }
    registered = false;
    const index = listeners.indexOf(registeredListener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  };
  onBeforeMount(unregister);
  registeredListener(createChange(GO_SAVE_EVENT.REBUILD));
  return unregister;
}

/** 保存快照并同步受控值、通知数据变化。 */
function save(snapshot: GoGameOptions, position?: number): boolean {
  const result = goHistoryData.insert(snapshot, position);
  if (result) {
    syncChange(GO_SAVE_EVENT.SAVE);
  }
  return result;
}

/** 清空历史并保存一条新的当前快照 */
function reset(snapshot: GoGameOptions): boolean {
  goHistoryData = new GoHistoryData([snapshot]);
  syncChange(GO_SAVE_EVENT.RESET);
  return true;
}

/** 读取指定位置快照并同步受控值、通知当前位置变化。 */
function load(position: number): GoGameOptions | undefined {
  const result = goHistoryData.jump(position);
  if (result !== undefined) {
    syncChange(GO_SAVE_EVENT.LOAD);
  }
  return result;
}

/** 前进指定步数并在位置变化后同步受控值、通知监听方。 */
function forward(step?: number): GoGameOptions | undefined {
  const result = goHistoryData.forward(step);
  if (result !== undefined) {
    syncChange(GO_SAVE_EVENT.FORWARD);
  }
  return result;
}

/** 后退指定步数并在位置变化后同步受控值、通知监听方。 */
function backward(step?: number): GoGameOptions | undefined {
  const result = goHistoryData.backward(step);
  if (result !== undefined) {
    syncChange(GO_SAVE_EVENT.BACKWARD);
  }
  return result;
}

/** 清除历史并在确实发生变化后同步受控值、通知监听方。 */
function clear() {
  if (goHistoryData.length === 0 && goHistoryData.current === -1) { return; }
  goHistoryData.clear();
  syncChange(GO_SAVE_EVENT.CLEAR);
}

/** 通过上下文暴露响应式历史属性和操作方法。 */
const context: GoSaveContext = {
  save,
  reset,
  load,
  forward,
  backward,
  clear,
  onListen,
  get version() {
    return version.value;
  },
  get current() {
    void version.value;
    return goHistoryData.current;
  },
  get length() {
    void version.value;
    return goHistoryData.length;
  },
  get snapshot() {
    void version.value;
    return goHistoryData.snapshot;
  },
  get snapshots() {
    void version.value;
    return goHistoryData.snapshots;
  },
};

provide(GO_SAVE_INJECTION, context);

defineExpose<GoSaveExposed>({ save, reset, load, forward, backward, clear, onListen });
</script>

<template>
  <slot />
</template>
