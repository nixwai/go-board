import type { InjectionKey } from 'vue';
import type { GoSaveContext } from './go-save';

/** GoSave 注入上下文的唯一 key。 */
export const GO_SAVE_INJECTION_KEY: InjectionKey<GoSaveContext> = Symbol('GO_SAVE_INJECTION_KEY');

/** GoSave 数据变化事件的 key。 */
export const GO_SAVE_EVENT_KEYS = {
  save: 'save',
  load: 'load',
  forward: 'forward',
  backward: 'backward',
  clear: 'clear',
} as const;

export type GoSaveEventKey = typeof GO_SAVE_EVENT_KEYS[keyof typeof GO_SAVE_EVENT_KEYS];
