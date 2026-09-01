import type { GoGameOptions, GoGamePosition, GoGameSnapshot, GoLayout, GoSign, GoVertex, KoInfo, PlayerSign } from '../types';
import { cloneVertex, createLayout } from '../create';
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
  /** 最新一手棋子的棋盘坐标。 */
  private latestVertex?: GoVertex;
  /** 缓存最近一次有效配置，用于重置。 */
  private cachedSnapshot!: GoGameSnapshot;

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

  /** 返回当前劫子信息的副本；无劫时为空。 */
  get ko(): KoInfo | undefined {
    const ko = this.boardData.ko;
    return ko.sign === 0 ? undefined : ko;
  }

  /** 返回当前棋盘布局的副本。 */
  get layout(): GoLayout {
    return this.boardData.layout;
  }

  /** 返回包含当前规则状态和最新落点的完整对局快照。 */
  get snapshot(): GoGameSnapshot {
    return {
      size: this.size,
      layout: this.layout,
      player: this.current,
      ko: this.ko,
      latestVertex: cloneVertex(this.latestVertex),
    };
  }

  /** 获取缓存的对局快照。 */
  get cached(): GoGameSnapshot {
    return this.cachedSnapshot;
  }

  private updateCached() {
    this.cachedSnapshot = this.snapshot;
  }

  /** 按配置更新对局，配置或规则校验失败时保持原状态。 */
  update(options: GoGameOptions): boolean {
    const size = normalizeSize(options.size ?? this.boardSize);
    if (options.layout && !isValidLayout(options.layout, size)) {
      return false;
    }

    const layout = options.layout || createLayout(size);
    const candidate = new GoBoardData(layout, options.ko);
    if (!candidate.isValid()) {
      return false;
    }

    this.boardSize = size;
    this.boardData = candidate;
    this.current = normalizePlayer(options.player);
    this.latestVertex = this.hasStone(options.latestVertex) ? cloneVertex(options.latestVertex) : undefined;
    return true;
  }

  /** 按配置重置对局，配置或规则校验失败时保持原状态，并缓存配置。 */
  reset(options?: GoGameOptions): boolean {
    const newOptions = options || this.cachedSnapshot;
    this.update(newOptions);
    this.updateCached();
    return true;
  }

  /** 清空棋盘，并设置新的尺寸和执棋方。 */
  clear(size?: number | string, next?: PlayerSign): void {
    this.boardSize = normalizeSize(size ?? this.boardSize);
    this.boardData = new GoBoardData(createLayout(this.boardSize));
    this.current = normalizePlayer(next);
    this.latestVertex = undefined;
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
      this.latestVertex = cloneVertex(vertex);
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

  /** 判断指定位置在当前棋盘中是否存在棋子。 */
  hasStone(position?: GoGamePosition): boolean {
    if (!position) { return false; }
    const vertex = this.toVertex(position);
    const sign = vertex ? this.boardData.get(vertex) : null;
    return sign === 1 || sign === -1;
  }

  /** 将文本坐标转换为规则引擎顶点，并确认其位于当前棋盘内。 */
  private toVertex(position: GoGamePosition): GoVertex | null {
    const vertex = normalizeVertex(position, this.boardData.widLen[1]);
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
