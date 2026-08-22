import type { Sign, SignMap, Vertex } from '@sabaki/go-board';
import type GoBoardData from '@sabaki/go-board';
import { cloneSignMap, createBoardData, createSignMap, normalizeNextPlayer, normalizeSize } from './commons';

export type PlayerSign = Exclude<Sign, 0>;

export interface GoGameOptions {
  layout: SignMap
  next: PlayerSign
}

export interface GoGameMove extends GoGameOptions {
  position: string
}

type BoardData = InstanceType<typeof GoBoardData>;

const DEFAULT_SIZE = 19;
const BLACK: PlayerSign = 1;

export class GoGame {
  private readonly boardSize: number;
  private board: BoardData;
  private current: PlayerSign;
  private initialState: GoGameOptions;

  constructor(size: number | string = DEFAULT_SIZE, options?: GoGameOptions) {
    this.boardSize = normalizeSize(size);
    const initialState = GoGame.createInitialState(this.boardSize, options);
    this.initialState = initialState;
    this.board = createBoardData(initialState.layout);
    this.current = initialState.next;
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

  getSnapshot(): GoGameOptions {
    return {
      layout: cloneSignMap(this.board.signMap),
      next: this.current,
    };
  }

  getBoard(): BoardData {
    return this.board.clone();
  }

  getSign(position: string): Sign | undefined {
    const vertex = this.toVertex(position);
    return vertex ? this.board.get(vertex) as Sign : undefined;
  }

  isLegal(position: string): boolean {
    const vertex = this.toVertex(position);
    return vertex !== null && this.isLegalVertex(vertex);
  }

  play(position?: string): boolean {
    if (!position?.trim()) {
      this.current = -this.current as PlayerSign;
      return true;
    }

    const normalized = this.normalizePosition(position);
    const vertex = this.toVertex(position);
    if (!normalized || !vertex || !this.isLegalVertex(vertex)) { return false; }

    try {
      this.board = this.board.makeMove(this.current, vertex, {
        preventOverwrite: true,
        preventSuicide: true,
      });
    }
    catch {
      return false;
    }

    this.current = -this.current as PlayerSign;
    return true;
  }

  reset(options?: GoGameOptions): boolean {
    if (options !== undefined) {
      if (!GoGame.isValidLayout(options.layout, this.boardSize)) { return false; }

      const candidate = createBoardData(options.layout);
      if (!candidate.isValid()) { return false; }
      this.initialState = {
        layout: cloneSignMap(options.layout),
        next: normalizeNextPlayer(options.next),
      };
    }

    this.board = createBoardData(this.initialState.layout);
    this.current = this.initialState.next;
    return true;
  }

  normalizePosition(position: string): string | null {
    const normalized = position.trim().toUpperCase();
    const match = /^([A-HJ-Z])(\d+)$/.exec(normalized);
    if (!match) { return null; }

    const row = Number(match[2]);
    if (!Number.isInteger(row) || row < 1 || row > this.boardSize) { return null; }
    return `${match[1]}${row}`;
  }

  parsePosition(position: string): Vertex | null {
    return this.toVertex(position);
  }

  private toVertex(position: string): Vertex | null {
    const normalized = this.normalizePosition(position);
    if (!normalized) { return null; }

    const vertex = this.board.parseVertex(normalized);
    return this.board.has(vertex) ? vertex : null;
  }

  private isLegalVertex(vertex: Vertex): boolean {
    if (this.board.get(vertex) !== 0) { return false; }
    const analysis = this.board.analyzeMove(this.current, vertex);
    return !analysis.pass && !analysis.overwrite && !analysis.suicide;
  }

  private static isValidLayout(layout: SignMap | undefined, size: number): layout is SignMap {
    if (!Array.isArray(layout) || layout.length !== size) { return false; }
    if (layout.some(row => !Array.isArray(row) || row.length !== size)) { return false; }
    return layout.every(row => row.every(sign => sign === -1 || sign === 0 || sign === 1));
  }

  private static createInitialState(size: number, options?: GoGameOptions): GoGameOptions {
    if (!options || !GoGame.isValidLayout(options.layout, size)) {
      return {
        layout: createSignMap(size),
        next: BLACK,
      };
    }

    const candidate = createBoardData(options.layout);
    if (!candidate.isValid()) {
      return {
        layout: createSignMap(size),
        next: BLACK,
      };
    }

    return {
      layout: cloneSignMap(options.layout),
      next: normalizeNextPlayer(options.next),
    };
  }
}
