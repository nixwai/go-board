import { withInstall } from '@go-board/ui';
import GoSaveComponent from './src/go-save.vue';

/** 支持单独注册的游戏存档组件。 */
const GoSave = withInstall(GoSaveComponent);

export { GoSave };
/** 导出游戏存档组件的属性、事件、上下文、实例类型和注入 key。 */
export type * from './src/go-save';
export type { GoSaveInstance } from './src/instance';
export * from './src/keys';
