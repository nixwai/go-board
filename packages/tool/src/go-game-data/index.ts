import type { GoGameOptions, GoGamePosition, GoLayout, GoSign, GoVertex, PlayerSign } from '../types';
import { createLayout } from '../create';
import { GoBoardData } from '../go-board-data';
import { normalizePlayer, normalizeSize, normalizeVertex } from '../normalize';
import { isValidLayout } from '../verify';

/** 基于围棋规则引擎的轻量对局状态管理器。 */
export class GoGameData {
  /** 当前棋盘尺寸。 */
  private boardSize!: number;
  /** 当前规则引擎棋盘数据。 */
  private boardData!: GoBoardData;
  /** 当前执棋方。 */
  private current!: PlayerSign;
  /** 缓存最近一次有效配置，用于重置。 */
  private cachedOptions?: GoGameOptions;

  /** 使用给定配置创建对局；无效配置时回退为空棋盘。 */
  constructor(options?: GoGameOptions) {
    if (!this.reset(options)) {
      this.clear(options?.size);
      this.updateCached();
    }
  }

  /** 拷贝获取当前对局棋盘状态。 */
  get board(): GoBoardData {
    return this.boardData.clone();
  }

  /** 返回当前棋盘尺寸。 */
  get size(): number {
    return this.boardSize;
  }

  /** 返回当前执棋方。 */
  get player(): PlayerSign {
    return this.current;
  }

  /** 返回当前棋盘布局的副本。 */
  get layout(): GoLayout {
    return this.boardData.layout;
  }

  /** 返回包含尺寸、布局和执棋方的完整对局快照。 */
  get snapshot(): Required<GoGameOptions> {
    return {
      size: this.size,
      layout: this.layout,
      player: this.current,
    };
  }

  private updateCached() {
    this.cachedOptions = this.snapshot;
  }

  /** 按配置重置对局，C配置或规则校验失败时保持原状态。 */
  reset(options?: GoGameOptions): boolean {
    const newOptions = options || this.cachedOptions;
    const size = normalizeSize(newOptions?.size ?? this.boardSize);
    if (options?.layout && !isValidLayout(options.layout, size)) {
      return false;
    }

    const layout = options?.layout || createLayout(size);
    const candidate = new GoBoardData(layout);
    if (!candidate.isValid()) {
      return false;
    }

    this.boardSize = size;
    this.boardData = candidate;
    this.current = normalizePlayer(options?.player);
    this.updateCached();
    return true;
  }

  /** 清空棋盘，并设置新的尺寸和执棋方。 */
  clear(size?: number | string, next?: PlayerSign): void {
    this.boardSize = normalizeSize(size ?? this.boardSize);
    this.boardData = new GoBoardData(createLayout(this.boardSize));
    this.current = normalizePlayer(next);
  }

  /** 尝试在指定位置落子，可临时指定本次落子的执棋方。 */
  play(position: GoGamePosition, player?: PlayerSign): boolean {
    const vertex = this.toVertex(position);
    if (!vertex || !this.isLegalVertex(vertex)) {
      return false;
    }

    try {
      if (player) {
        this.current = normalizePlayer(player);
      }
      this.boardData = this.boardData.makeMove(this.current, vertex, {
        preventOverwrite: true,
        preventSuicide: true,
        preventKo: true,
      });
    }
    catch {
      return false;
    }
    return true;
  }

  /** 切换到另一方执棋。 */
  rotate(): void {
    this.current = -this.current as PlayerSign;
  }

  /** 获取指定位置的棋子标记。 */
  getSign(position: GoGamePosition): GoSign | undefined {
    const vertex = this.toVertex(position);
    return vertex ? this.boardData.get(vertex) as GoSign : undefined;
  }

  /** 判断指定位置对当前执棋方是否为合法落点。 */
  isLegal(position: GoGamePosition): boolean {
    const vertex = this.toVertex(position);
    return this.isLegalVertex(vertex);
  }

  /** 将文本坐标转换为规则引擎顶点，并确认其位于当前棋盘内。 */
  private toVertex(position: GoGamePosition): GoVertex | null {
    const vertex = normalizeVertex(position, this.boardData.widLen);
    return vertex && this.boardData.has(vertex) ? vertex : null;
  }

  /** 使用规则引擎分析顶点，排除占用、提子、自杀和打劫落点。 */
  private isLegalVertex(vertex?: GoVertex | null): boolean {
    if (!vertex) {
      return false;
    }

    if (this.boardData.get(vertex) !== 0) {
      return false;
    }

    const analysis = this.boardData.analyzeMove(this.current, vertex);
    return !analysis.pass && !analysis.overwrite && !analysis.suicide && !analysis.ko;
  }
}
