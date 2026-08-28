import type { GoGameOptions, GoGamePosition, GoGameSnapshot } from '@go-board/tool';

/** 棋盘状态事件的数据结构。 */
export type GoBoardEvent = GoGameSnapshot;

/** 围棋棋盘组件的输入属性。 */
export interface GoBoardProps {
  /** 是否禁用交互。 */
  disabled?: boolean
  /** 棋盘容器宽度。 */
  width?: number | string
  /** 棋盘初始化配置。 */
  init?: GoGameOptions
}

/** 围棋棋盘组件通过模板引用暴露的实例方法。 */
export interface GoBoardExposed {
  /** 在指定坐标落子；不传坐标时仅推进当前回合。 */
  play: (position?: GoGamePosition) => boolean
  /** 使用新的配置重置棋盘。 */
  reset: (options?: GoGameOptions) => boolean
}
