import type { GoSaveChange, GoSaveInstance } from '../go-save';
import { inject, onBeforeUnmount, ref } from 'vue';
import { GO_SAVE_INJECTION } from '../go-save';

/** 订阅存档上下文，并维护历史控制组件共享的状态和操作。 */
export function useGoSave(goSaveInstance?: GoSaveInstance) {
  const goSave = goSaveInstance ?? inject(GO_SAVE_INJECTION);
  const version = ref(goSave?.version ?? 0);
  const current = ref(goSave?.current ?? -1);
  const snapshotLen = ref(goSave?.length ?? 0);
  const snapshot = ref(goSave?.snapshot);
  const snapshotList = ref(goSave?.snapshots ?? []);

  let archiveMutationDepth = 0;

  /** 标记组合式 API 主动发起的修改，避免监听方重复处理同一事件。 */
  function runArchiveMutation<T, P extends unknown[]>(mutation?: (...params: P) => T) {
    return (...params: P) => {
      archiveMutationDepth += 1;
      try {
        return mutation?.(...params);
      }
      finally {
        archiveMutationDepth -= 1;
      }
    };
  }

  /** 注册外部存档监听，并过滤当前组合式 API 主动发起的修改。 */
  function onSnapshotListen(fn: (change: GoSaveChange) => void) {
    goSave?.onListen((change: GoSaveChange) => {
      if (archiveMutationDepth > 0) { return; } // 忽略正在执行的修改
      fn(change);
    }, onBeforeUnmount);
  }

  goSave?.onListen((change: GoSaveChange) => {
    version.value = change.version;
    current.value = change.current;
    snapshotLen.value = change.length;
    snapshot.value = change.snapshot;
    snapshotList.value = change.snapshots;
  }, onBeforeUnmount);

  return {
    isValid: Boolean(goSave),
    version,
    current,
    snapshot,
    snapshotLen,
    snapshotList,
    saveSnapshot: runArchiveMutation(goSave?.save),
    resetSnapshot: runArchiveMutation(goSave?.reset),
    loadSnapshot: runArchiveMutation(goSave?.load),
    forwardSnapshot: runArchiveMutation(goSave?.forward),
    backwardSnapshot: runArchiveMutation(goSave?.backward),
    clearSnapshots: runArchiveMutation(goSave?.clear),
    onSnapshotListen,
  };
}
