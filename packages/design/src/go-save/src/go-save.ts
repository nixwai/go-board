import type { GoGameOptions } from '@go-board/tool';
import type { onBeforeMount } from 'vue';

import type { GoSaveEventKey } from './keys';

/** 存档数据变化时通知子组件的历史信息。 */
export interface GoSaveChange {
  /** 触发变化的操作类型。 */
  key: GoSaveEventKey
  /** 变化后的当前历史位置。 */
  current: number
  /** 变化后的历史长度。 */
  length: number
  /** 变化后的当前位置快照。 */
  snapshot?: GoGameOptions
  /** 当前全部历史快照。 */
  snapshots: GoGameOptions[]
}

/** 存档数据变化监听函数。 */
export type GoSaveChangeListener = (change: GoSaveChange) => void;

/** 注册监听时接收注销方法的 Vue 生命周期回调。 */
export type GoSaveOnBeforeMount = typeof onBeforeMount;

/** GoSave 对外提供给子组件的存档上下文。 */
export interface GoSaveContext {
  /** 保存快照，并丢弃当前快照之后的历史记录。 */
  save: (snapshot: GoGameOptions, position?: number) => boolean
  /** 清空历史并保存一条新的当前快照。 */
  reset: (snapshot: GoGameOptions) => boolean
  /** 读取指定位置的快照。 */
  load: (position: number) => GoGameOptions | undefined
  /** 向历史前方移动指定步数。 */
  forward: (step?: number) => GoGameOptions | undefined
  /** 向历史后方移动指定步数。 */
  backward: (step?: number) => GoGameOptions | undefined
  /** 清除全部历史记录。 */
  clear: () => void
  /** 历史状态版本，每次历史数据或位置变化时递增。 */
  readonly version: number
  /** 当前历史位置。 */
  readonly current: number
  /** 历史快照数量。 */
  readonly length: number
  /** 当前历史位置对应的快照。 */
  readonly snapshot: GoGameOptions | undefined
  /** 全部历史快照。 */
  readonly snapshots: GoGameOptions[]
  /** 注册数据变化监听，并返回注销方法。 */
  onListen: (
    listener: GoSaveChangeListener,
    onBeforeMount: GoSaveOnBeforeMount,
  ) => () => void
}

/** GoSave 暴露给模板引用的实例方法。 */
export interface GoSaveExposed {
  save: GoSaveContext['save']
  reset: GoSaveContext['reset']
  load: GoSaveContext['load']
  forward: GoSaveContext['forward']
  backward: GoSaveContext['backward']
  clear: GoSaveContext['clear']
  onListen: GoSaveContext['onListen']
}

/** GoSave 组件的输入属性。 */
export interface GoSaveProps {
  /** 初始化或受控的历史快照列表；组件不会深拷贝快照。 */
  value?: GoGameOptions[]
}
