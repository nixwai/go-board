# Go Board

基于 Vue 3 和 TypeScript 的围棋棋盘组件库。`@go-board/design` 当前公开提供 `GoBoard` 组件，并重新导出 `@go-board/tool` 的围棋规则类型、状态管理器与工具函数。

## 特性

- 提供可直接使用的围棋棋盘组件。
- 支持 1～25 路棋盘，默认 19 路。
- 支持初始化棋盘布局、当前执棋方和劫点信息。
- 支持鼠标悬停预览、点击落子、提子、自杀手和立即回提校验。
- 支持标记最近一次落子，并可禁用全部棋盘交互。
- 支持通过模板引用调用落子、停一手和重置方法。
- 支持单组件导入或全量注册。
- 支持 TypeScript 类型导出和原生 DOM、ARIA 属性透传。

## 安装

组件包名称为 `@go-board/design`，运行环境需要 Vue 3.3 或更高版本。

### pnpm

```bash
pnpm add @go-board/design
```

### npm

```bash
npm install @go-board/design
```

### yarn

```bash
yarn add @go-board/design
```

## 使用

### 全量注册

在应用入口注册组件库：

```ts
import GoBoardDesign from '@go-board/design';
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.use(GoBoardDesign);
app.mount('#app');
```

注册后可以直接在模板中使用 `GoBoard`：

```vue
<template>
  <GoBoard :init="{ size: 9 }" />
</template>
```

### 单组件导入

```vue
<script setup lang="ts">
import { GoBoard } from '@go-board/design';
</script>

<template>
  <GoBoard :width="480" :init="{ size: 9 }" />
</template>
```

### 完整示例

```vue
<script setup lang="ts">
import type {
  GoBoardEvent,
  GoBoardInstance,
  GoGameOptions,
} from '@go-board/design';

import { GoBoard } from '@go-board/design';
import { ref } from 'vue';

const boardRef = ref<GoBoardInstance>();

const init: GoGameOptions = {
  size: 9,
  player: 1,
};

function playAtD4() {
  boardRef.value?.play('D4');
}

function pass() {
  boardRef.value?.play();
}

function resetBoard() {
  boardRef.value?.reset();
}

function handleMove(event: GoBoardEvent) {
  console.log('落子位置：', event.latestVertex);
  console.log('落子后的棋盘：', event.layout);
  console.log('下一执棋方：', event.player);
}

function handleUpdate(event: GoBoardEvent) {
  console.log('棋盘已更新：', event.layout, event.player);
}
</script>

<template>
  <div>
    <GoBoard
      ref="boardRef"
      :width="480"
      :init="init"
      aria-label="围棋棋盘"
      @move="handleMove"
      @update="handleUpdate"
    />

    <button type="button" @click="playAtD4">落子 D4</button>
    <button type="button" @click="pass">停一手</button>
    <button type="button" @click="resetBoard">重置</button>
  </div>
</template>
```

## 组件

### GoBoard

围棋棋盘组件，负责棋盘展示和基于 `GoGameData` 规则引擎的落子交互。组件内部组合 `@go-board/ui` 的基础棋盘组件，并为根节点设置 `grid` 语义、行列数量和单元格语义。

#### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 是否禁用棋盘单元格及鼠标交互。禁用后仍可通过组件实例调用 `play()` 和 `reset()`。 |
| `width` | `number \| string` | `'100%'` | 棋盘容器宽度。正数按像素处理，字符串作为 CSS 宽度值使用；无效数字或空字符串使用 `100%`。 |
| `init` | `GoGameOptions` | — | 棋局初始化配置，支持 `size`、`layout`、`player`、`ko` 和 `latestVertex`。 |

`GoBoard` 没有独立的 `size` Prop，棋盘路数通过 `init.size` 设置，后续可以通过 `reset({ size })` 修改。

`size` 会被截断并限制在 `1`～`25` 的整数范围；未设置或无效时默认为 `19`。传入组件的原生 DOM 属性、`class`、`style` 和 ARIA 属性会透传到棋盘根元素。

#### `init` 配置

```ts
interface GoGameOptions {
  size?: number | string;
  layout?: GoLayout;
  player?: PlayerSign;
  ko?: KoInfo;
  latestVertex?: GoVertex;
}
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number \| string` | `19` | 棋盘边长，支持 1～25 路。 |
| `layout` | `GoLayout` | 空棋盘 | 初始棋盘布局，必须是 `size × size` 的二维数组，且现有棋块必须至少有一口气。 |
| `player` | `PlayerSign` | `1` | 当前执棋方：`1` 表示黑方，`-1` 表示白方。 |
| `ko` | `KoInfo` | `{ sign: 0, vertex: [-1, -1] }` | 初始劫子信息，包含受限方和劫点。 |
| `latestVertex` | `GoVertex` | — | 最新一手棋子的棋盘坐标；坐标无棋子或越界时自动置空。 |

棋盘布局中的棋子标记如下：

| 值 | 含义 |
| --- | --- |
| `1` | 黑棋 |
| `-1` | 白棋 |
| `0` | 空位 |

示例：

```ts
const init = {
  size: 5,
  player: -1,
  layout: [
    [0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, -1, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};
```

#### Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `move` | `GoBoardEvent` | 合法落子后触发，包含 `latestVertex` 及切换执棋方后的完整棋局快照。 |
| `update` | `GoBoardEvent` | 合法落子、停一手或重置成功后触发，包含最新完整棋局快照；停一手时保留上一手 `latestVertex`。 |

```ts
type GoBoardEvent = GoGameSnapshot;
```

#### Expose 方法

通过模板 `ref` 获取组件实例后，可以调用以下方法：

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `play` | `position?: GoGamePosition` | `boolean` | 在指定坐标落子；不传坐标、空字符串或纯空白字符串表示停一手。落子非法时返回 `false`，成功后自动切换执棋方。 |
| `reset` | `options?: GoGameOptions` | `boolean` | 使用新配置重置棋盘；不传参数时恢复最近一次有效配置。布局或规则校验失败时返回 `false` 并保留当前状态；无效 `latestVertex` 会被置空。 |

```ts
import type { GoBoardExposed } from '@go-board/design';

const boardRef = ref<GoBoardExposed>();

boardRef.value?.play('D4');
boardRef.value?.play();
boardRef.value?.reset({ size: 13, player: 1 });
```

## 其他

### @go-board/tool

棋局状态管理、不可变棋盘规则实例、坐标归一化、布局创建与校验工具，均已由 `@go-board/design` 重新导出，可以直接引入使用。

相关使用方法请查看相应文档：[@go-board/tool](https://github.com/nixwai/go-board/blob/main/packages/tool/README.md)

### @go-board/ui

基础棋盘 UI 组件库，负责棋盘绘制、棋子展示、单元格交互和无障碍语义，不负责围棋落子规则与棋局状态管理。

详情请查看：[@go-board/ui](https://github.com/nixwai/go-board/blob/main/packages/ui/README.md)

## 许可证

[MIT](LICENSE)
