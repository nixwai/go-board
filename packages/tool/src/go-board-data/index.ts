import type { GoLayout, GoSign, GoVertex, KoInfo } from '../types';
import type { GoMoveAnalysis, GoMoveOptions } from './typing';
import { cloneLayout } from '../create';
import { vertexEquals } from '../verify';

function vertexKey(vertex: GoVertex): string {
  return `${vertex[0]},${vertex[1]}`;
}

/**
 * 基于二维棋盘布局实现围棋落子、提子、气和打劫规则。
 *
 * 每次落子都基于当前布局创建新实例，原实例及其布局不会被修改。
 */
export class GoBoardData {
  /** 当前实例内部持有的棋盘布局。 */
  private readonly layoutInfo: GoLayout;
  /** 棋盘行数。 */
  readonly height: number;
  /** 棋盘列数。 */
  readonly width: number;

  private readonly captures: Record<Exclude<GoSign, 0>, number>;
  private koInfo: KoInfo;

  /** 使用二维棋盘布局和可选劫子信息创建规则实例。 */
  constructor(layout: GoLayout = [], ko: KoInfo = { sign: 0, vertex: [-1, -1] }) {
    this.height = layout.length;
    this.width = this.height === 0 ? 0 : layout[0]!.length;

    if (layout.some(row => row.length !== this.width)) {
      throw new Error('layout is not well-formed');
    }

    this.layoutInfo = cloneLayout(layout);
    this.captures = { 1: 0, [-1]: 0 };
    this.koInfo = { sign: ko.sign, vertex: [...ko.vertex] };
  }

  /** 获取棋盘尺寸。 */
  get widLen(): [number, number] {
    return [this.width, this.height];
  }

  /** 返回当前布局的深拷贝，避免外部修改规则实例。 */
  get layout(): GoLayout {
    return cloneLayout(this.layoutInfo);
  }

  /** 返回当前劫子信息的深拷贝。 */
  get ko(): KoInfo {
    return {
      sign: this.koInfo.sign,
      vertex: [...this.koInfo.vertex],
    };
  }

  /** 获取顶点上的棋子标记；越界顶点返回 `null`。 */
  get(vertex: GoVertex): GoSign | null {
    return this.layoutInfo[vertex[1]]?.[vertex[0]] ?? null;
  }

  /** 判断顶点是否位于当前棋盘范围内。 */
  has(vertex: GoVertex): boolean {
    const [x, y] = vertex;
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /** 按围棋规则生成落子后的新棋盘实例。 */
  makeMove(sign: GoSign, vertex: GoVertex, options: GoMoveOptions = {}): GoBoardData {
    if (sign === 0 || !this.has(vertex)) {
      return this.clone();
    }

    if (options.preventOverwrite && this.get(vertex)) {
      throw new Error('Overwrite prevented');
    }

    if (options.preventKo && this.koInfo.sign === sign && vertexEquals(this.koInfo.vertex, vertex)) {
      throw new Error('Ko prevented');
    }

    const move = this.clone();
    const opponent: Exclude<GoSign, 0> = sign === 1 ? -1 : 1;
    move.set(vertex, sign);

    // 先移除因本次落子失去最后一口气的相邻对方棋块。
    const neighbors = move.getNeighbors(vertex);
    const deadStones: GoVertex[] = [];
    const deadNeighbors = neighbors.filter(
      neighbor => move.get(neighbor) === opponent && !move.hasLiberties(neighbor),
    );

    for (const neighbor of deadNeighbors) {
      if (move.get(neighbor) === 0) {
        continue;
      }

      for (const stone of move.getChain(neighbor)) {
        move.set(stone, 0);
        move.setCaptures(sign, count => count + 1);
        deadStones.push(stone);
      }
    }

    // 单子提取、唯一回气点且相邻无己方棋子时，记录下一手的打劫点。
    const liberties = move.getLiberties(vertex);
    const hasKo = deadStones.length === 1
      && liberties.length === 1
      && vertexEquals(liberties[0]!, deadStones[0]!)
      && neighbors.every(neighbor => move.get(neighbor) !== sign);

    move.koInfo = {
      sign: hasKo ? opponent : 0,
      vertex: hasKo ? [...deadStones[0]!] : [-1, -1],
    };

    // 没有提子且己方棋块无气时，该手属于自杀；按选项决定是否抛错。
    if (deadStones.length === 0 && liberties.length === 0) {
      if (options.preventSuicide) {
        throw new Error('Suicide prevented');
      }

      for (const stone of move.getChain(vertex)) {
        move.set(stone, 0);
        move.setCaptures(opponent, count => count + 1);
      }
    }

    return move;
  }

  /** 分析落子是否合法，但不改变当前棋盘布局或提子计数。 */
  analyzeMove(sign: GoSign, vertex: GoVertex): GoMoveAnalysis {
    const pass = sign === 0 || !this.has(vertex);
    const overwrite = !pass && !!this.get(vertex);
    const ko = this.koInfo.sign === sign && vertexEquals(this.koInfo.vertex, vertex);

    const candidate = this.clone();
    candidate.set(vertex, sign);

    const opponent: Exclude<GoSign, 0> = sign === 1 ? -1 : 1;
    const capturing = !pass && candidate
      .getNeighbors(vertex)
      .some(neighbor => candidate.get(neighbor) === opponent && !candidate.hasLiberties(neighbor));
    const suicide = !pass && !capturing && !candidate.hasLiberties(vertex);

    return { pass, overwrite, capturing, suicide, ko };
  }

  /** 返回指定一方已经提取的棋子数量。 */
  getCaptures(sign: GoSign): number | null {
    if (sign !== 1 && sign !== -1) {
      return null;
    }

    return this.captures[sign];
  }

  /** 判断当前布局中是否存在没有气的棋块或非法棋子标记。 */
  isValid(): boolean {
    const visited = new Set<string>();

    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        const vertex: GoVertex = [x, y];
        const sign = this.get(vertex);
        if (sign !== -1 && sign !== 0 && sign !== 1) {
          return false;
        }
        if (sign === 0 || visited.has(vertexKey(vertex))) {
          continue;
        }
        if (!this.hasLiberties(vertex)) {
          return false;
        }

        for (const stone of this.getChain(vertex)) {
          visited.add(vertexKey(stone));
        }
      }
    }

    return true;
  }

  /** 返回顶点的上、下、左、右相邻顶点，不包含越界坐标。 */
  getNeighbors(vertex: GoVertex): GoVertex[] {
    if (!this.has(vertex)) {
      return [];
    }

    const [x, y] = vertex;
    const neighbors: GoVertex[] = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]];
    return neighbors.filter(neighbor => this.has(neighbor));
  }

  /** 按给定条件查找与顶点连通的顶点集合。 */
  getConnectedComponent(
    vertex: GoVertex,
    predicate: (vertex: GoVertex) => boolean,
    result: GoVertex[] = [],
  ): GoVertex[] {
    if (!this.has(vertex)) {
      return [];
    }

    if (result.length === 0) {
      result.push(vertex);
    }

    for (const neighbor of this.getNeighbors(vertex)) {
      if (!predicate(neighbor) || result.some(item => vertexEquals(item, neighbor))) {
        continue;
      }

      result.push(neighbor);
      this.getConnectedComponent(neighbor, predicate, result);
    }

    return result;
  }

  /** 返回与指定棋子同色且相连的完整棋块。 */
  getChain(vertex: GoVertex): GoVertex[] {
    const sign = this.get(vertex);
    return this.getConnectedComponent(vertex, neighbor => this.get(neighbor) === sign);
  }

  /** 返回指定棋块所有不重复的气。 */
  getLiberties(vertex: GoVertex): GoVertex[] {
    if (!this.has(vertex) || this.get(vertex) === 0) {
      return [];
    }

    const liberties: GoVertex[] = [];
    const added = new Set<string>();

    for (const stone of this.getChain(vertex)) {
      for (const neighbor of this.getNeighbors(stone)) {
        if (this.get(neighbor) !== 0 || added.has(vertexKey(neighbor))) {
          continue;
        }

        added.add(vertexKey(neighbor));
        liberties.push(neighbor);
      }
    }

    return liberties;
  }

  /** 判断指定棋块是否至少拥有一口气。 */
  hasLiberties(vertex: GoVertex): boolean {
    return this.getLiberties(vertex).length > 0;
  }

  clone(): GoBoardData {
    const result = new GoBoardData(this.layoutInfo, this.koInfo);
    result.captures[1] = this.captures[1];
    result.captures[-1] = this.captures[-1];
    return result;
  }

  private set(vertex: GoVertex, sign: GoSign): void {
    if (this.has(vertex)) {
      this.layoutInfo[vertex[1]]![vertex[0]] = sign;
    }
  }

  private setCaptures(sign: Exclude<GoSign, 0>, mutator: (count: number) => number): void {
    this.captures[sign] = mutator(this.captures[sign]);
  }
}
