import { withInstall } from '../utils';
import GoBoardComponent from './src/go-board.vue';

/** 支持单独注册的围棋棋盘组件。 */
const GoBoard = withInstall(GoBoardComponent);

export { GoBoard };
/** 导出围棋棋盘组件的属性、事件和实例类型。 */
export * from './src/go-board';
