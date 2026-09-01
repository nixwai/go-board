import type { GoGameOptions } from '../types';

function isValidStep(step: number): boolean {
  return Number.isInteger(step) && step > 0;
}

/** 记录并管理 GoGameData 产生的对局快照历史。 */
export class GoHistoryData {
  private history: GoGameOptions[];
  private position: number;

  /** 使用快照列表和当前播放位置创建历史记录，默认定位到最后一个快照。 */
  constructor(snapshots: GoGameOptions[] = [], currentPosition = snapshots.length - 1) {
    this.history = [...snapshots];
    const normalizedPosition = Number.isFinite(currentPosition) ? Math.trunc(currentPosition) : 0;
    this.position = this.history.length > 0
      ? Math.min(Math.max(normalizedPosition, 0), this.history.length - 1)
      : -1;
  }

  /** 返回历史快照数量。 */
  get length(): number {
    return this.history.length;
  }

  /** 返回当前播放位置，空历史返回 -1。 */
  get current(): number {
    return this.position;
  }

  /** 返回当前播放位置对应的快照。 */
  get snapshot(): GoGameOptions | undefined {
    return this.history[this.position];
  }

  /** 返回全部历史快照。 */
  get snapshots(): GoGameOptions[] {
    return this.history;
  }

  /** 清空全部历史快照，并将当前播放位置重置为空历史状态。 */
  clear(): void {
    this.history.length = 0;
    this.position = -1;
  }

  /** 基于当前播放位置向前查看指定步数，并更新当前播放位置。 */
  backward(step = 1): GoGameOptions | undefined {
    if (!isValidStep(step)) {
      return undefined;
    }

    return this.jump(this.position - step);
  }

  /** 基于当前播放位置向后查看指定步数，并更新当前播放位置。 */
  forward(step = 1): GoGameOptions | undefined {
    if (!isValidStep(step)) {
      return undefined;
    }

    return this.jump(this.position + step);
  }

  /** 直接跳转到指定播放位置，并返回对应的快照。 */
  jump(position: number): GoGameOptions | undefined {
    if (!Number.isInteger(position) || position < 0 || position >= this.history.length) {
      return undefined;
    }

    this.position = position;
    return this.snapshot;
  }

  /** 插入快照，并丢弃插入位置之后的全部历史记录。 */
  insert(snapshot: GoGameOptions, position = this.position + 1): boolean {
    if (!Number.isInteger(position) || position < 0 || position > this.history.length) {
      return false;
    }

    this.history.length = position;
    this.history.push(snapshot);
    this.position = position;
    return true;
  }
}
