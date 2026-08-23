import type GoBoardData from '@sabaki/go-board';
import type { GoGameOptions, GoGamePosition, GoLayout, GoSign, GoVertex, PlayerSign } from '../types';
import { cloneLayout, createBoardData, createLayout } from '../create';
import { normalizePlayer, normalizePosition, normalizeSize } from '../normalize';
import { isValidLayout } from '../verify';

type BoardData = InstanceType<typeof GoBoardData>;

/** 基于 sabaki 围棋规则引擎的轻量对局状态管理器。 */
export class GoGame {
  /** 当前棋盘尺寸。 */
  private boardSize!: number;
  /** 当前规则引擎棋盘数据。 */
  private board!: BoardData;
  /** 当前执棋方。 */
  private current!: PlayerSign;

  /** 最近一次有效配置，用于无参数重置。 */
  private cachedOptions?: GoGameOptions;

  /** 使用给定配置创建对局；无效配置时回退为空棋盘。 */
  constructor(options?: GoGameOptions) {
    if (!this.reset(options)) {
      this.clear(options?.size);
      this.cachedOptions = this.snapshot;
    }
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
    return cloneLayout(this.board.signMap);
  }

  /** 返回包含尺寸、布局和执棋方的完整对局快照。 */
  get snapshot(): Required<GoGameOptions> {
    return {
      size: this.size,
      layout: this.layout,
      player: this.current,
    };
  }

  /** 按配置重置对局，配置或规则校验失败时保持原状态。 */
  reset(options?: GoGameOptions): boolean {
    const newOptions = options || this.cachedOptions;
    const size = normalizeSize(newOptions?.size ?? this.boardSize);
    if (options?.layout && !isValidLayout(options.layout, size)) { return false; }

    const signMap = options?.layout || createLayout(size);
    const candidate = createBoardData(signMap);
    if (!candidate.isValid()) { return false; }

    this.boardSize = size;
    this.board = candidate;
    this.current = normalizePlayer(options?.player);
    this.cachedOptions = this.snapshot;
    return true;
  }

  /** 清空棋盘，并设置新的尺寸和执棋方。 */
  clear(size?: number | string, next?: PlayerSign) {
    this.boardSize = normalizeSize(size ?? this.boardSize);
    const signMap = createLayout(this.boardSize);
    this.board = createBoardData(signMap);
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
      this.board = this.board.makeMove(this.current, vertex, {
        preventOverwrite: true,
        preventSuicide: true,
      });
    }
    catch {
      return false;
    }
    return true;
  }

  /** 切换到另一方执棋。 */
  rotate() {
    this.current = -this.current as PlayerSign;
  }

  /** 获取指定位置的棋子标记。 */
  getSign(position: GoGamePosition): GoSign | undefined {
    const vertex = this.toVertex(position);
    return vertex ? this.board.get(vertex) as GoSign : undefined;
  }

  /** 判断指定位置对当前执棋方是否为合法落点。 */
  isLegal(position: GoGamePosition): boolean {
    const vertex = this.toVertex(position);
    return this.isLegalVertex(vertex);
  }

  /** 将文本坐标转换为规则引擎顶点，并确认其位于当前棋盘内。 */
  private toVertex(position: GoGamePosition): GoVertex | null {
    if (typeof position === 'string') {
      const normalized = normalizePosition(position);
      if (!normalized) { return null; }
      position = this.board.parseVertex(normalized);
    }
    return this.board.has(position) ? position : null;
  }

  /** 使用规则引擎分析顶点，排除占用、提子规则和自杀手。 */
  private isLegalVertex(vertex?: GoVertex | null): boolean {
    if (!vertex) { return false; }

    if (this.board.get(vertex) !== 0) { return false; }

    const analysis = this.board.analyzeMove(this.current, vertex);
    return !analysis.pass && !analysis.overwrite && !analysis.suicide;
  }
}
