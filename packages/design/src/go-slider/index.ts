import { withInstall } from '@go-board/ui';
import GoSliderComponent from './src/go-slider.vue';

/** 支持单独注册的历史快照滑动输入条组件。 */
const GoSlider = withInstall(GoSliderComponent);

export { GoSlider };
/** 导出滑动输入条组件的属性和实例类型。 */
export type * from './src/go-slider';
export type { GoSliderInstance } from './src/instance';
