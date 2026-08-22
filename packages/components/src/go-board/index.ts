import { withInstall } from '../utils';
import GoBoardComponent from './go-board.vue';

const GoBoard = withInstall(GoBoardComponent);

export { GoBoard };
export * from './go-board';
