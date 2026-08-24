# @go-board/ui

`@go-board/ui` 是 Go Board 的基础棋盘 UI 组件库，提供可组合的围棋棋盘、棋盘网格和棋子组件：

- `Chessboard`：绘制棋盘容器、网格线和星位。
- `ChessGrid`：根据二维棋子数据渲染可交互的棋盘网格。
- `ChessPiece`：渲染黑棋、白棋及预览状态的棋子。

组件基于 Vue 3 开发，支持单独注册和完整注册。组件库只负责棋盘 UI 展示与交互，落子规则、棋局状态和数据管理由使用方负责。

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
import { Chessboard, ChessGrid, ChessPiece } from '@go-board/ui';
import { ref } from 'vue';

type ChessSign = 0 | 1 | -1;

const rows = ref<ChessSign[][]>([
  [0, 0, 0],
  [0, 1, 0],
  [-1, 0, 0],
]);

function handleCellClick(position: string) {
  console.log(`点击了 ${position}`);
}
</script>

<template>
  <Chessboard :size="3" :width="240">
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

组件、Props、插槽参数和实例类型均从 `@go-board/ui` 导出：

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
```

## 组件

### Chessboard

棋盘容器组件。组件会保持正方形布局，并自动绘制棋盘网格线和星位；棋盘内容通过默认插槽传入，通常与 `ChessGrid` 组合使用。

#### 基础用法

```vue
<template>
  <Chessboard :size="9" :width="360">
    <!-- 棋盘内容，例如 ChessGrid -->
  </Chessboard>
</template>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `size` | 棋盘边长，同时决定网格线和星位数量 | `number \| string` | — |
| `width` | 棋盘宽度；数字会按像素处理，字符串会作为 CSS 宽度使用 | `number \| string` | `100%` |

`size` 会被规范化为正整数；无效值会按 `1` 处理。`width` 传入数字时会转换为 `${width}px`，空字符串会按 `100%` 处理。

#### Slots

| 插槽 | 说明 |
| --- | --- |
| `default` | 棋盘内容，通常放置 `ChessGrid`。 |

#### 属性透传

传入组件的原生 DOM 属性、`class`、`style` 和其他属性会透传到棋盘根元素。

#### 源码

[Chessboard 源码](https://github.com/nixwai/go-board/tree/main/packages/ui/src/chessboard)

### ChessGrid

棋盘网格组件。根据 `rows` 二维数组渲染棋盘单元格，不绘制棋盘线；每个单元格都是可交互按钮，并通过作用域插槽自定义单元格内容。

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
  <ChessGrid :rows="rows">
    <template #default="{ sign, position }">
      <span>{{ position }}: {{ sign }}</span>
    </template>
  </ChessGrid>
</template>
```

`rows` 按从上到下的顺序表示棋盘行。组件会将列标记为 `A`、`B`、`C`……，跳过字母 `I`；例如，3×3 数据的第一行坐标为 `A3`、`B3`、`C3`，最后一行坐标为 `A1`、`B1`、`C1`。

#### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `rows` | 按行保存的棋子标记；`1` 表示黑棋，`-1` 表示白棋，`0` 表示空位 | `(0 \| 1 \| -1)[][]` | — |

使用时应保证 `rows` 为正方形二维数组，外层数组长度和每个内层数组长度应与棋盘边长一致。

#### Slots

| 插槽 | 说明 | 参数 |
| --- | --- | --- |
| `default` | 自定义每个棋盘单元格的内容 | `sign: 0 \| 1 \| -1`<br>`position: string` |

#### Events

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| `cellMouseenter` | 鼠标进入棋盘单元格时触发 | `position: string` |
| `cellClick` | 点击棋盘单元格时触发 | `position: string` |

在 Vue 模板中使用短横线事件名：

```vue
<ChessGrid
  :rows="rows"
  @cell-mouseenter="handleMouseenter"
  @cell-click="handleCellClick"
/>
```

#### 属性透传

传入组件的原生 DOM 属性、`class`、`style` 和其他属性会透传到网格根元素。

#### 源码

[ChessGrid 源码](https://github.com/nixwai/go-board/tree/main/packages/ui/src/chess-grid)

### ChessPiece

棋子组件。根据 `sign` 渲染黑棋或白棋，并支持使用半透明预览样式显示待落子棋子。

#### 基础用法

```vue
<script setup lang="ts">
import { ChessPiece } from '@go-board/ui';
</script>

<template>
  <ChessPiece :sign="1" />
  <ChessPiece :sign="-1" />
  <ChessPiece :sign="1" preview />
</template>
```

#### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `sign` | 棋子颜色；`1` 表示黑棋，`-1` 表示白棋 | `1 \| -1` | — |
| `preview` | 是否以半透明预览样式显示 | `boolean` | `false` |

#### Slots

无。

#### Events

无。

#### 源码

[ChessPiece 源码](https://github.com/nixwai/go-board/tree/main/packages/ui/src/chess-piece)

## 组件组合

`Chessboard`、`ChessGrid` 和 `ChessPiece` 可以组合构建完整棋盘：

```vue
<script setup lang="ts">
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

function handleCellClick(position: string) {
  console.log(`点击了 ${position}`);
}
</script>

<template>
  <Chessboard :size="9" :width="360">
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