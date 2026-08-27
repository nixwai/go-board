# @go-board/tool

围棋棋局状态管理与棋盘数据工具

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

game.play('D4');
console.log(game.layout);
console.log(game.getSign('D4')); // 1

game.rotate();
game.play('E4');
```

棋子标记：`1` 表示黑子，`-1` 表示白子，`0` 表示空位。坐标字母不使用 `I`，例如 `A1`、`D4`。

## 导出常量

| 名称 | 类型 | 说明 |
| --- | --- | --- |
| `DEFAULT_SIZE` | `number` | 默认棋盘边长，值为 `19`。 |
| `MIN_SIZE` | `number` | 棋盘边长最小值，值为 `1`。 |
| `MAX_SIZE` | `number` | 棋盘边长最大值，值为 `25`。 |

## `GoGameData`

### 构造参数 `GoGameOptions`

```ts
interface GoGameOptions {
  size?: number | string;
  layout?: GoLayout;
  player?: PlayerSign;
}
```

| 参数 | 类型 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `size` | `number \| string` | 棋盘边长，最终会被截断并限制在 `1`～`25`。 | `19` |
| `layout` | `GoLayout` | 初始棋盘布局，必须是 `size × size` 的二维数组。 | 空棋盘 |
| `player` | `PlayerSign` | 当前执棋方：`1` 黑方，`-1` 白方。 | `1` |

### 属性

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `size` | `number` | 当前棋盘边长。 |
| `player` | `PlayerSign` | 当前执棋方。 |
| `layout` | `GoLayout` | 当前棋盘布局的副本。修改返回值不会影响棋局。 |
| `snapshot` | `Required<GoGameOptions>` | 当前棋盘边长、布局和执棋方的完整快照。 |

### 方法

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `reset` | `options?: GoGameOptions` | `boolean` | 按配置重置棋局。配置或布局校验失败时返回 `false`，并保留原状态；不传参数时恢复最近一次有效配置。 |
| `clear` | `size?: number \| string`<br>`next?: PlayerSign` | `void` | 清空棋盘，并设置棋盘边长和下一执棋方。 |
| `play` | `position: GoGamePosition`<br>`player?: PlayerSign` | `boolean` | 尝试落子。位置无效、已有棋子或形成自杀手时返回 `false`；成功落子返回 `true`。成功后不会自动切换执棋方。 |
| `rotate` | 无 | `void` | 在黑方和白方之间切换执棋方。 |
| `getSign` | `position: GoGamePosition` | `GoSign \| undefined` | 获取指定位置的棋子标记；位置无效时返回 `undefined`。 |
| `isLegal` | `position: GoGamePosition` | `boolean` | 判断指定位置对当前执棋方是否可以合法落子。 |

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
if (game.isLegal('C3')) {
  game.play('C3');
  game.rotate();
}
```

## 创建函数

| 函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `cloneLayout` | `layout: GoLayout` | `GoLayout` | 深拷贝棋盘布局，避免直接修改原二维数组。 |
| `createLayout` | `size: number` | `GoLayout` | 创建指定边长的空棋盘布局。 |
| `createBoardData` | `layout: GoLayout` | `GoBoardData` | 根据棋盘布局创建 `GoBoardData` 规则引擎实例。传入布局会先被复制。 |

```ts
import { createLayout, cloneLayout, createBoardData } from '@go-board/tool';

const layout = createLayout(9);
const copiedLayout = cloneLayout(layout);
const board = createBoardData(copiedLayout);
```

## 归一化函数

| 函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `normalizePlayer` | `value: GoSign \| undefined` | `1 \| -1` | 将执棋方归一化为 `1` 或 `-1`；只有 `-1` 会保留为白方，其他值按黑方处理。 |
| `normalizeSize` | `value?: number \| string` | `number` | 将棋盘边长转换为整数，并限制在 `1`～`25`；无效值使用 `19`。 |
| `normalizePosition` | `position: string` | `string \| null` | 去除首尾空格并转为大写；格式无效时返回 `null`。不校验坐标是否超出具体棋盘范围。 |

```ts
import { normalizePlayer, normalizeSize, normalizePosition } from '@go-board/tool';

normalizePlayer(undefined); // 1
normalizeSize('9.8'); // 9
normalizePosition(' d4 '); // 'D4'
normalizePosition('I4'); // null
```

## 校验函数

| 函数 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `isValidLayout` | `layout: GoLayout \| undefined`<br>`size: number` | `boolean` | 校验布局是否为 `size × size` 的二维数组，且每个棋子标记只能是 `-1`、`0` 或 `1`。 |

```ts
import { isValidLayout } from '@go-board/tool';

const layout = [
  [0, 1],
  [-1, 0],
];

isValidLayout(layout, 2); // true
```

## 类型导出

| 类型 | 说明 |
| --- | --- |
| `GoSign` | 棋子标记：`-1 \| 0 \| 1`。 |
| `GoLayout` | 棋盘二维布局数据，类型为 `GoSign[][]`。 |
| `GoVertex` | 棋盘顶点坐标，类型为 `[number, number]`。 |
| `GoGamePosition` | 落子位置：文本坐标或 `GoVertex`。 |
| `PlayerSign` | 执棋方：`-1 \| 1`。 |
| `GoGameOptions` | `GoGameData` 的初始化和重置配置。 |

## License

[MIT](../../LICENSE) License
