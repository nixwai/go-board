import { withInstall } from '../utils';
import ChessPieceComponent from './src/chess-piece.vue';

/** 支持单独注册的棋子组件。 */
const ChessPiece = withInstall(ChessPieceComponent);

export { ChessPiece };
/** 导出棋子组件的属性和实例类型。 */
export * from './src/chess-piece';
export * from './src/instance';
