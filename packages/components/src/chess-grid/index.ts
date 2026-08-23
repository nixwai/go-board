import { withInstall } from '../utils';
import ChessGridComponent from './src/chess-grid.vue';

/** 支持单独注册的棋盘网格组件。 */
const ChessGrid = withInstall(ChessGridComponent);

export { ChessGrid };
/** 导出棋盘网格组件的属性、插槽和实例类型。 */
export * from './src/chess-grid';
export * from './src/instance';
