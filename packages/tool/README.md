# @go-board/tool

围棋棋局状态管理、不可变棋盘规则、坐标转换、布局创建与校验工具。

## 安装

```bash
# pnpm
pnpm add @go-board/tool

# npm
npm install @go-board/tool

# yarn
yarn add @go-board/tool
```

## 基础使用

```ts
import { GoGameData } from '@go-board/tool';

const game = new GoGameData({ size: 9 });

if (game.play('D4')) {
  game.rotate();
}

console.log(game.layout);
console.log(game.getSign('D4')); // 1
```

棋子标记：`1` 表示黑子，`-1` 表示白子，`0` 表示空位。文本坐标字母不使用 `I`，例如 `A1`、`D4`；顶点坐标使用 `[x, y]`，左上角为 `[0, 0]`。

## 导出常量

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `DEFAULT_SIZE` | `number` | 默认棋盘边长，值为 `19`。 |
| `MIN_SIZE` | `number` | 棋盘边长最小值，值为 `1`。 |
| `MAX_SIZE` | `number` | 棋盘边长最大值，值为 `25`。 |

## `GoBoardData`

`GoBoardData` 基于二维布局实现落子、提子、棋块、气、提子计数和简单劫规则。构造函数会复制传入布局和劫点；`layout`、`ko`、`makeMove()` 与 `clone()` 也不会向外暴露内部数组引用。传入行长度不一致的二维数组时，构造函数会抛出 `layout is not well-formed` 异常。

```ts
import { GoBoardData } from '@go-board/tool';

const board = new GoBoardData([
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 0],
], {
  sign: 1,
  vertex: [2, 1],
});
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `height` | `number` | 棋盘行数。 |
| `width` | `number` | 棋盘列数。 |
| `widLen` | `[number, number]` | 按 `[width, height]` 返回棋盘尺寸。 |
| `layout` | `GoLayout` | 当前布局的深拷贝。 |
| `ko` | `KoInfo` | 当前劫子信息的深拷贝。 |

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `get` | `vertex: GoVertex` | `GoSign \| null` | 获取顶点棋子，越界时返回 `null`。 |
| `has` | `vertex: GoVertex` | `boolean` | 判断顶点是否位于棋盘内。 |
| `makeMove` | `sign: GoSign`<br>`vertex: GoVertex`<br>`options?: { preventOverwrite?: boolean; preventSuicide?: boolean; preventKo?: boolean }` | `GoBoardData` | 返回落子后的新实例；可阻止覆盖、自杀和立即回提。棋子标记为 `0` 或顶点越界时返回当前状态的副本。 |
| `analyzeMove` | `sign: GoSign`<br>`vertex: GoVertex` | `{ pass: boolean; overwrite: boolean; capturing: boolean; suicide: boolean; ko: boolean }` | 在不修改当前实例的前提下分析停着、覆盖、提子、自杀和劫。 |
| `getCaptures` | `sign: GoSign` | `number \| null` | 返回黑方或白方的累计提子数，传入 `0` 时返回 `null`。 |
| `isValid` | 无 | `boolean` | 校验棋子标记是否合法，并确认每个现有棋块至少有一口气。 |
| `getNeighbors` | `vertex: GoVertex` | `GoVertex[]` | 返回顶点上下左右的有效相邻点。 |
| `getConnectedComponent` | `vertex: GoVertex`<br>`predicate: (vertex) => boolean`<br>`result?: GoVertex[]` | `GoVertex[]` | 按条件查找连通顶点集合。 |
| `getChain` | `vertex: GoVertex` | `GoVertex[]` | 返回与指定棋子同色且相连的完整棋块。 |
| `getLiberties` | `vertex: GoVertex` | `GoVertex[]` | 返回指定棋块所有不重复的气。 |
| `hasLiberties` | `vertex: GoVertex` | `boolean` | 判断指定棋块是否至少有一口气。 |
| `clone` | 无 | `GoBoardData` | 复制布局、劫点和提子计数并返回新实例。 |

`makeMove()` 选项中的 `preventOverwrite`、`preventSuicide` 和 `preventKo` 默认均未启用；启用后发生对应冲突会分别抛出 `Overwrite prevented`、`Suicide prevented` 或 `Ko prevented` 异常。`GoGameData` 调用规则实例落子时会同时启用这三项限制，并将规则异常转换为 `false`。

## `GoGameData`

### 构造参数 `GoGameOptions`

```ts
interface GoGameOptions {
  size?: number | string;
  layout?: GoLayout;
  player?: PlayerSign;
  ko?: KoInfo;
}
```

| 参数 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `size` | `number \| string` | 棋盘边长，最终会被截断并限制在 `1`～`25`。 | `19` |
| `layout` | `GoLayout` | 初始棋盘布局，必须是 `size × size` 的二维数组，且现有棋块必须至少有一口气。 | 空棋盘 |
| `player` | `PlayerSign` | 当前执棋方：`1` 黑方，`-1` 白方。 | `1` |
| `ko` | `KoInfo` | 初始劫子信息，包含受限方和劫点。 | `{ sign: 0, vertex: [-1, -1] }` |

构造配置无效时会回退到对应尺寸的空棋盘和黑方执棋。

### 属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `board` | `GoBoardData` | 当前规则实例的副本。 |
| `size` | `number` | 当前棋盘边长。 |
| `player` | `PlayerSign` | 当前执棋方。 |
| `ko` | `KoInfo` | 当前劫子信息的副本。 |
| `layout` | `GoLayout` | 当前棋盘布局的副本。修改返回值不会影响棋局。 |
| `snapshot` | `Required<GoGameOptions>` | 当前棋盘边长、布局、执棋方和劫子信息的完整副本。 |

### 方法

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `reset` | `options?: GoGameOptions` | `boolean` | 按配置重置棋局。配置或布局校验失败时返回 `false` 并保留原状态；不传参数时恢复最近一次有效配置。 |
| `clear` | `size?: number \| string`<br>`next?: PlayerSign` | `void` | 清空棋盘，并设置棋盘边长和执棋方；不会更新 `reset()` 使用的最近有效配置。 |
| `play` | `position: GoGamePosition`<br>`player?: PlayerSign` | `boolean` | 尝试落子并执行占位、提子、自杀手和立即回提校验。成功后不会自动切换执棋方；可选 `player` 会在合法性预检通过后写入当前执棋方。 |
| `rotate` | 无 | `void` | 在黑方和白方之间切换执棋方。 |
| `getSign` | `position: GoGamePosition` | `GoSign \| undefined` | 获取指定位置的棋子标记；位置无效或越界时返回 `undefined`。 |
| `isLegal` | `position: GoGamePosition` | `boolean` | 判断指定位置对当前执棋方是否为合法落点。 |

`player` 参数不是临时覆盖：合法性预检使用调用前的当前执棋方，预检通过后才写入指定执棋方，并且不会自动恢复；如果随后规则实例抛出异常，方法返回 `false`，但已写入的执棋方仍会保留。

### 示例：初始化棋局

```ts
import { GoGameData } from '@go-board/tool';

const game = new GoGameData({
  size: 5,
  player: -1,
  layout: [
    [0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0],
    [0, -1, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
});
```

### 示例：判断并落子

```ts
if (game.isLegal('C3') && game.play('C3')) {
  game.rotate();
}
```

## 创建函数

| 函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `cloneLayout` | `layout: GoLayout` | `GoLayout` | 深拷贝棋盘布局，避免直接修改原二维数组。 |
| `createLayout` | `size: number` | `GoLayout` | 创建指定边长的空棋盘布局。 |

```ts
import { cloneLayout, createLayout } from '@go-board/tool';

const layout = createLayout(9);
const copiedLayout = cloneLayout(layout);
```

## 归一化函数

| 函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `normalizePlayer` | `value?: number` | `PlayerSign` | 只有 `-1` 会保留为白方，其他值按黑方 `1` 处理。 |
| `normalizeSize` | `value?: number \| string` | `number` | 将棋盘边长截断为整数并限制在 `1`～`25`；无效值使用 `19`。 |
| `normalizePosition` | `position: GoGamePosition`<br>`len: number` | `string \| null` | 将文本或 `GoVertex` 坐标统一转换为大写文本坐标；拒绝字母 `I`、缺少行号或小于 `1` 的行号。 |
| `normalizeVertex` | `position: GoGamePosition`<br>`len: number` | `GoVertex \| null` | 将文本坐标转换为左上角原点的顶点坐标；传入顶点时原样返回，不校验棋盘边界。 |

```ts
import { normalizePlayer, normalizePosition, normalizeSize, normalizeVertex } from '@go-board/tool';

normalizePlayer(undefined); // 1
normalizeSize('9.8'); // 9
normalizePosition(' d4 ', 9); // 'D4'
normalizePosition([1, 2], 3); // 'B1'
normalizePosition('I4', 9); // null
normalizeVertex('A3', 3); // [0, 0]
```

## 校验函数

| 函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `isValidLayout` | `layout: GoLayout \| undefined`<br>`size: number` | `boolean` | 校验布局是否为 `size × size` 的二维数组，且每个棋子标记只能是 `-1`、`0` 或 `1`。 |
| `vertexEquals` | `first: GoVertex`<br>`second: GoVertex` | `boolean` | 判断两个顶点的横纵坐标是否相等。 |

```ts
import { isValidLayout, vertexEquals } from '@go-board/tool';

const layout = [
  [0, 1],
  [-1, 0],
];

isValidLayout(layout, 2); // true
vertexEquals([0, 1], [0, 1]); // true
```

## 类型导出

| 类型 | 说明 |
| --- | --- |
| `GoSign` | 棋子标记：`-1 \| 0 \| 1`。 |
| `GoLayout` | 棋盘二维布局数据，类型为 `GoSign[][]`。 |
| `GoVertex` | 棋盘顶点坐标，类型为 `[number, number]`。 |
| `GoGamePosition` | 落子位置：文本坐标或 `GoVertex`。 |
| `PlayerSign` | 执棋方：`-1 \| 1`。 |
| `KoInfo` | 劫子信息，包含 `sign` 和 `vertex`。 |
| `GoGameOptions` | `GoGameData` 的初始化和重置配置。 |

## License

[MIT](../../LICENSE) License
