import { withInstall } from '@go-board/ui';
import GoSaveComponent from './src/go-save.vue';

/** 支持单独注册的游戏存档组件。 */
const GoSave = withInstall(GoSaveComponent);

export { GoSave };
/** 导出游戏存档组件的属性、事件、上下文和注入 key。 */
export * from './src/go-save';
export * from './src/keys';
