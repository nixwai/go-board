import { inject, onBeforeUnmount, ref } from 'vue';
import { GO_SAVE_INJECTION } from '../go-save/src/keys';

/** 订阅存档上下文，并维护历史控制组件共享的当前位置和长度。 */
export function useGoSave() {
  const goSave = inject(GO_SAVE_INJECTION);
  const current = ref(-1);
  const length = ref(0);

  goSave?.onListen((change) => {
    current.value = change.current;
    length.value = change.length;
  }, onBeforeUnmount);

  return {
    current,
    goSave,
    length,
  };
}
