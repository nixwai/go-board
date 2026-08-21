import { withInstall } from '../utils/install';
import GoBoardComponent from './go-board.vue';

const GoBoard = withInstall(GoBoardComponent);

export { GoBoard };
export * from './go-board';
