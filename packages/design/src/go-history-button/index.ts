import { withInstall } from '@go-board/ui';
import GoHistoryButtonComponent from './src/go-history-button.vue';

/** 支持单独注册的历史记录控制按钮组件。 */
const GoHistoryButton = withInstall(GoHistoryButtonComponent);

export { GoHistoryButton };
/** 导出历史记录控制按钮组件的属性和实例类型。 */
export type * from './src/go-history-button';
export type { GoHistoryButtonInstance } from './src/instance';
