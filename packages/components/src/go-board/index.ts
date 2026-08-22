import { withInstall } from '../utils';
import GoBoardComponent from './src/go-board.vue';

const GoBoard = withInstall(GoBoardComponent);

export { GoBoard };
export * from './src/go-board';
