import type { Sign, SignMap, Vertex } from '@sabaki/go-board';
import type GoBoardData from '@sabaki/go-board';
import { cloneSignMap, createBoardData, createSignMap, isValidSignMap } from './commons';
import { normalizeNextPlayer, normalizePosition, normalizeSize } from './normalize';

export type PlayerSign = Exclude<Sign, 0>;

export interface GoGameOptions {
  size?: number | string
  layout?: SignMap
  next?: PlayerSign
}

export type GoGamePosition = string | Vertex;

type BoardData = InstanceType<typeof GoBoardData>;

export class GoGame {
  private boardSize!: number;
  private board!: BoardData;
  private current!: PlayerSign;

  private cachedOptions?: GoGameOptions;

  constructor(options?: GoGameOptions) {
    if (!this.reset(options)) {
      this.clear(options?.next);
      this.cachedOptions = this.snapshot;
    }
  }

  get size(): number {
    return this.boardSize;
  }

  get next(): PlayerSign {
    return this.current;
  }

  get layout(): SignMap {
    return cloneSignMap(this.board.signMap);
  }

  get snapshot(): Required<GoGameOptions> {
    return {
      size: this.size,
      layout: this.layout,
      next: this.current,
    };
  }

  reset(options?: GoGameOptions): boolean {
    const newOptions = options || this.cachedOptions;
    const size = normalizeSize(newOptions?.size);
    if (options?.layout && !isValidSignMap(options.layout, size)) { return false; }

    const signMap = options?.layout || createSignMap(size);
    const candidate = createBoardData(signMap);
    if (!candidate.isValid()) { return false; }

    this.boardSize = size;
    this.board = candidate;
    this.current = normalizeNextPlayer(options?.next);
    this.cachedOptions = this.snapshot;
    return true;
  }

  clear(size?: number, next?: PlayerSign) {
    this.boardSize = normalizeSize(size || this.boardSize);
    const signMap = createSignMap(this.boardSize);
    this.board = createBoardData(signMap);
    this.current = normalizeNextPlayer(next);
  }

  play(position: GoGamePosition, current?: PlayerSign): boolean {
    const vertex = this.toVertex(position);
    if (!vertex || !this.isLegalVertex(vertex)) {
      return false;
    }

    try {
      this.board = this.board.makeMove(current || this.current, vertex, {
        preventOverwrite: true,
        preventSuicide: true,
      });
    }
    catch {
      return false;
    }

    if (!current) {
      this.rotate();
    }
    return true;
  }

  rotate() {
    this.current = -this.current as PlayerSign;
  }

  getSign(position: GoGamePosition): Sign | undefined {
    const vertex = this.toVertex(position);
    return vertex ? this.board.get(vertex) as Sign : undefined;
  }

  isLegal(position: GoGamePosition): boolean {
    const vertex = this.toVertex(position);
    return this.isLegalVertex(vertex);
  }

  private toVertex(position: GoGamePosition): Vertex | null {
    if (typeof position === 'string') {
      const normalized = normalizePosition(position);
      if (!normalized) { return null; }
      position = this.board.parseVertex(normalized);
    }
    return this.board.has(position) ? position : null;
  }

  private isLegalVertex(vertex?: Vertex | null): boolean {
    if (!vertex) { return false; }

    if (this.board.get(vertex) !== 0) { return false; }

    const analysis = this.board.analyzeMove(this.current, vertex);
    return !analysis.pass && !analysis.overwrite && !analysis.suicide;
  }
}
