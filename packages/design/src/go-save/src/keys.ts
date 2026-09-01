import type { InjectionKey } from 'vue';
import type { GoSaveContext } from './go-save';

/** GoSave 注入上下文的唯一 key。 */
export const GO_SAVE_INJECTION: InjectionKey<GoSaveContext> = Symbol('GO_SAVE_INJECTION_KEY');

/** GoSave 数据变化事件的 key。 */
export const GO_SAVE_EVENT = {
  SAVE: 'save',
  RESET: 'reset',
  LOAD: 'load',
  FORWARD: 'forward',
  BACKWARD: 'backward',
  CLEAR: 'clear',
  REBUILD: 'rebuild',
} as const;

export type GoSaveEventKey = typeof GO_SAVE_EVENT[keyof typeof GO_SAVE_EVENT];
