# @go-board/ui

`@go-board/ui` 是 Go Board 的基础棋盘 UI 组件库，提供可组合的围棋棋盘、棋盘网格和棋子组件：

- `Chessboard`：绘制正方形棋盘容器、网格线和星位。
- `ChessGrid`：根据二维棋子数据渲染带无障碍语义的可交互棋盘网格。
- `ChessPiece`：渲染黑棋、白棋、预览状态和最近落子标记。

组件基于 Vue 3 开发，支持单独注册和完整注册。组件库负责棋盘 UI、单元格交互和属性透传；落子规则、提子、轮次和棋局状态由使用方负责。运行环境需要 Vue 3.3 或更高版本。

## 安装

### npm

```shell
npm install @go-board/ui
```

### yarn

```shell
yarn add @go-board/ui
```

### pnpm

```shell
pnpm add @go-board/ui
```

## 使用

### 按需导入

从 `@go-board/ui` 导入需要使用的组件。组件已附带单组件 `install` 方法，可以直接注册到 Vue 应用，也可以在模板中局部使用。

```vue
<script setup lang="ts">
import type { ChessGridPosition } from '@go-board/ui';

import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { ref } from 'vue';

type ChessSign = 0 | 1 | -1;

const rows = ref<ChessSign[][]>([
  [0, 0, 0],
  [0, 1, 0],
  [-1, 0, 0],
]);

function handleCellClick(position: ChessGridPosition) {
  console.log(`点击了 ${position}`);
}
</script>

<template>
  <Chessboard :size="3" :width="240" role="grid" aria-label="围棋棋盘">
    <ChessGrid :rows="rows" @cell-click="handleCellClick">
      <template #default="{ sign }">
        <ChessPiece v-if="sign !== 0" :sign="sign" />
      </template>
    </ChessGrid>
  </Chessboard>
</template>
```

### 完整导入

```ts
import GoBoardUI from '@go-board/ui';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.use(GoBoardUI);
app.mount('#app');
```

完整导入后，可以直接在模板中使用 `Chessboard`、`ChessGrid` 和 `ChessPiece`：

```vue
<template>
  <Chessboard :size="9" />
</template>
```

### TypeScript

组件、Props、插槽参数和实例类型均从 `@go-board/ui` 导出；`withInstall` 也可用于为自定义 Vue 组件附加单组件安装能力。

```ts
import type {
  ChessGridInstance,
  ChessGridProps,
  ChessGridSlotProps,
  ChessPieceInstance,
  ChessPieceProps,
  ChessboardInstance,
  ChessboardProps,
} from '@go-board/ui';

import { withInstall } from '@go-board/ui';
```

## 组件

### Chessboard

棋盘容器组件。组件会保持正方形布局，并根据 `size` 自动绘制棋盘网格线和星位；棋盘内容通过默认插槽传入，通常与 `ChessGrid` 组合使用。

#### 基础用法

```vue
<template>
  <Chessboard :size="9" :width="360" show-coord>
    <!-- 棋盘内容，例如 ChessGrid -->
  </Chessboard>
</template>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `size` | 棋盘边长，同时决定网格线和星位数量 | `number \| string` | — |
| `width` | 棋盘宽度；正数按像素处理，字符串作为 CSS 宽度使用 | `number \| string` | `'100%'` |
| `showCoord` | 是否在棋盘左右两侧显示行坐标 | `boolean` | `false` |

`size` 只接受正整数或可转换为正整数的字符串，无效值按 `1` 处理。`width` 传入非正数、非有限数字或空字符串时按 `100%` 处理。棋盘始终使用固定 `5%` 内部边距。启用 `showCoord` 后，仅在左右两侧显示从上到下递减的行号。

小于 9 路的奇数棋盘绘制中心星位；9～12 路绘制四角星位，奇数棋盘额外绘制中心星位；13 路及以上的奇数棋盘绘制九个星位，偶数棋盘绘制四角星位。

#### Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 棋盘内容，通常放置 `ChessGrid`。 |

#### 属性透传

传入组件的原生 DOM 属性、`class`、`style`、事件和 ARIA 属性会透传到稳定的棋盘根元素。组件绘制的网格线和星位 SVG 对辅助技术隐藏，且不接收指针事件。

#### 源码

[Chessboard 源码](https://github.com/nixwai/go-board/tree/main/packages/ui/src/chessboard)

### ChessGrid

棋盘网格组件。根据 `rows` 二维数组渲染棋盘单元格，不绘制棋盘线；每个单元格都是 `button`，带 `gridcell`、坐标标签和占用状态语义，并通过作用域插槽自定义内容。

#### 基础用法

```vue
<script setup lang="ts">
import { ChessGrid } from '@go-board/ui';

type ChessSign = 0 | 1 | -1;

const rows: ChessSign[][] = [
  [0, 0, 0],
  [0, 1, 0],
  [-1, 0, 0],
];
</script>

<template>
  <div role="grid" aria-label="围棋棋盘">
    <ChessGrid :rows="rows">
      <template #default="{ sign, position }">
        <span>{{ position }}: {{ sign }}</span>
      </template>
    </ChessGrid>
  </div>
</template>
```

`rows` 按从上到下的顺序表示棋盘行。`position` 使用 `[x, y]` 二维索引坐标，`x` 为从左到右的列索引，`y` 为从上到下的行索引，均从 `0` 开始。

#### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `rows` | 按行保存的棋子标记；`1` 表示黑棋，`-1` 表示白棋，`0` 表示空位 | `(0 \| 1 \| -1)[][]` | — |
| `disabled` | 禁用所有单元格，并停止发送鼠标进入和点击事件 | `boolean` | `false` |

组件会复制每一行后再渲染。使用时应保证 `rows` 为正方形二维数组，外层数组长度和每个内层数组长度应与棋盘边长一致；列数不应超过当前坐标标签支持的 25 列。

#### Slots

| 插槽 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 自定义每个棋盘单元格的内容 | `sign: 0 \| 1 \| -1`<br>`position: ChessGridPosition` |

#### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| `cellMouseenter` | 鼠标进入未禁用的棋盘单元格时触发 | `position: ChessGridPosition` |
| `cellClick` | 点击未禁用的棋盘单元格时触发 | `position: ChessGridPosition` |

在 Vue 模板中使用短横线事件名：

```vue
<ChessGrid
  :rows="rows"
  @cell-mouseenter="handleMouseenter"
  @cell-click="handleCellClick"
/>
```

#### 属性透传

传入组件的原生 DOM 属性、`class`、`style` 和其他属性会透传到网格根元素。根元素固定使用 `presentation` 角色，单元格负责提供 `gridcell` 语义。

#### 源码

[ChessGrid 源码](https://github.com/nixwai/go-board/tree/main/packages/ui/src/chess-grid)

### ChessPiece

棋子组件。根据 `sign` 渲染黑棋或白棋，并支持使用半透明预览样式显示待落子棋子和标记最近一手棋子。

#### 基础用法

```vue
<script setup lang="ts">
import { ChessPiece } from '@go-board/ui';
</script>

<template>
  <ChessPiece :sign="1" />
  <ChessPiece :sign="-1" />
  <ChessPiece :sign="1" preview />
  <ChessPiece :sign="-1" marked />
</template>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `sign` | 棋子颜色；`1` 表示黑棋，`-1` 表示白棋 | `1 \| -1` | — |
| `preview` | 是否以半透明预览样式显示 | `boolean` | `false` |
| `marked` | 是否在棋子中心显示与棋子颜色相反的空心圆标记 | `boolean` | `false` |

传入组件的原生 DOM 属性、`class`、`style` 和其他属性会由 Vue 透传到棋子根元素。

#### Slots

无。

#### Events

无。

#### 源码

[ChessPiece 源码](https://github.com/nixwai/go-board/tree/main/packages/ui/src/chess-piece)

## 组件组合

`Chessboard`、`ChessGrid` 和 `ChessPiece` 可以组合构建完整棋盘；使用方负责维护二维布局并处理单元格事件：

```vue
<script setup lang="ts">
import type { ChessGridPosition } from '@go-board/ui';

import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { ref } from 'vue';

type ChessSign = 0 | 1 | -1;

const rows = ref<ChessSign[][]>([
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, -1, 0, 0, 0, 0],
]);

function handleCellClick(position: ChessGridPosition) {
  console.log(`点击了 ${position}`);
}
</script>

<template>
  <Chessboard :size="9" :width="360" role="grid">
    <ChessGrid
      :rows="rows"
      @cell-click="handleCellClick"
    >
      <template #default="{ sign }">
        <ChessPiece v-if="sign !== 0" :sign="sign" />
      </template>
    </ChessGrid>
  </Chessboard>
</template>
```

## License

[MIT](../../LICENSE) License
