import { withInstall } from '../utils';
import ChessboardComponent from './src/chessboard.vue';

/** 支持单独注册的棋盘容器组件。 */
const Chessboard = withInstall(ChessboardComponent);

export { Chessboard };
/** 导出棋盘容器组件的属性和实例类型。 */
export * from './src/chessboard';
export * from './src/instance';
