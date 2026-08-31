<script setup lang="ts">
import type { GoGameOptions } from '@go-board/tool';
import type { GoSaveChange, GoSaveChangeListener, GoSaveContext, GoSaveOnBeforeMount, GoSaveProps } from './go-save';

import { GoHistoryData } from '@go-board/tool';
import { provide, shallowRef, toRaw } from 'vue';
import { GO_SAVE_EVENT_KEYS, GO_SAVE_INJECTION_KEY } from './keys';

defineOptions({ name: 'GoSave' });

const props = defineProps<GoSaveProps>();

defineSlots<{
  /** 存档上下文的默认内容插槽，不传递作用域参数。 */
  default: () => unknown
}>();

/** 使用调用方提供的快照引用维护历史，不在组件内部进行深拷贝。 */
const snapshots = props.snapshots ? toRaw(props.snapshots) : [];
const goHistoryData = new GoHistoryData(snapshots, props.currentPosition);
const version = shallowRef(0);
const listeners: GoSaveChangeListener[] = [];

/** 触发响应式属性更新；历史类本身仍负责保存真实数据。 */
function refresh() {
  version.value += 1;
}

/** 创建当前历史状态事件，向监听方传递原始快照引用。 */
function createChange(key: GoSaveChange['key']): GoSaveChange {
  return {
    key,
    current: goHistoryData.current,
    length: goHistoryData.length,
    snapshot: goHistoryData.snapshot,
    snapshots: goHistoryData.snapshots,
  };
}

/** 通知全部监听方当前历史发生变化。 */
function notify(key: GoSaveChange['key']) {
  const change = createChange(key);
  listeners.slice().forEach(listener => listener(change));
}

/** 注册历史变化监听，并将注销方法交给调用方的生命周期回调。 */
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
  return unregister;
}

/** 保存快照并通知数据变化。 */
function save(snapshot: GoGameOptions, position?: number): boolean {
  const result = goHistoryData.insert(snapshot, position);
  if (result) {
    refresh();
    notify(GO_SAVE_EVENT_KEYS.save);
  }
  return result;
}

/** 读取指定位置快照并通知当前位置变化。 */
function load(position: number): GoGameOptions | undefined {
  const result = goHistoryData.jump(position);
  if (result !== undefined) {
    refresh();
    notify(GO_SAVE_EVENT_KEYS.load);
  }
  return result;
}

/** 前进指定步数并在位置变化后通知监听方。 */
function forward(step?: number): GoGameOptions | undefined {
  const result = goHistoryData.forward(step);
  if (result !== undefined) {
    refresh();
    notify(GO_SAVE_EVENT_KEYS.forward);
  }
  return result;
}

/** 后退指定步数并在位置变化后通知监听方。 */
function backward(step?: number): GoGameOptions | undefined {
  const result = goHistoryData.backward(step);
  if (result !== undefined) {
    refresh();
    notify(GO_SAVE_EVENT_KEYS.backward);
  }
  return result;
}

/** 清除历史并在确实发生变化后通知监听方。 */
function clear() {
  if (goHistoryData.length === 0 && goHistoryData.current === -1) { return; }
  goHistoryData.clear();
  refresh();
  notify(GO_SAVE_EVENT_KEYS.clear);
}

/** 通过上下文暴露响应式历史属性和操作方法。 */
const context: GoSaveContext = {
  save,
  load,
  forward,
  backward,
  clear,
  onListen,
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

provide(GO_SAVE_INJECTION_KEY, context);
</script>

<template>
  <slot />
</template>
