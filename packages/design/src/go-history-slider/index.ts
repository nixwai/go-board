import { withInstall } from '@go-board/ui';
import GoHistorySliderComponent from './src/go-history-slider.vue';

/** 支持单独注册的历史快照滑动输入条组件。 */
const GoHistorySlider = withInstall(GoHistorySliderComponent);

export { GoHistorySlider };
/** 导出滑动输入条组件的属性和实例类型。 */
export type * from './src/go-history-slider';
export type { GoHistorySliderInstance } from './src/instance';
