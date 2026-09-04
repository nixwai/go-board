import { withInstall } from '../utils';
import ChessInfluenceComponent from './src/chess-influence.vue';

/** 支持单独注册的势力组件。 */
const ChessInfluence = withInstall(ChessInfluenceComponent);

export { ChessInfluence };
/** 导出势力组件的属性和实例类型。 */
export * from './src/chess-influence';
export * from './src/instance';
