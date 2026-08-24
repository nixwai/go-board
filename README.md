# Go Board

基于 Vue 3 和 TypeScript 的围棋棋盘组件库，当前公开提供 `GoBoard` 组件，并 re-export `@go-board/tool` 的围棋规则类型与工具。

## 特性

- 提供可直接使用的围棋棋盘组件。
- 支持 1～25 路棋盘，默认 19 路。
- 支持初始化棋盘布局和指定当前执棋方。
- 支持鼠标悬停预览、点击落子、提子和自杀手校验。
- 支持通过模板引用调用落子和重置方法。
- 支持单组件导入或全量注册。
- 支持 TypeScript 类型导出。

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
  GoBoardInstance,
  GoBoardMoveEvent,
  GoBoardUpdateEvent,
} from '@go-board/design';

import { GoBoard } from '@go-board/design';
import { ref } from 'vue';

const boardRef = ref<GoBoardInstance>();

const init = {
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

function handleMove(event: GoBoardMoveEvent) {
  console.log('落子位置：', event.position);
  console.log('落子后的棋盘：', event.layout);
  console.log('事件发出时的执棋方：', event.player);
}

function handleUpdate(event: GoBoardUpdateEvent) {
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

围棋棋盘组件，负责棋盘展示和基于 `GoGame` 规则引擎的落子交互。组件内部组合基础棋盘 UI，但基础 UI 组件不是 `@go-board/design` 的公开组件。

#### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `width` | `number \| string` | `'100%'` | 棋盘容器宽度。数字按像素处理，字符串作为 CSS 宽度值使用。 |
| `init` | `GoGameOptions` | — | 棋局初始化配置，支持 `size`、`layout` 和 `player`。 |

`GoBoard` 没有独立的 `size` Prop，棋盘路数通过 `init.size` 设置，后续可以通过 `reset({ size })` 修改。

`size` 会被归一化到 `1`～`25` 的整数范围；未设置或无效时默认为 `19`。

#### `init` 配置

```ts
interface GoGameOptions {
  size?: number | string;
  layout?: GoLayout;
  player?: PlayerSign;
}
```

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number \| string` | `19` | 棋盘边长，支持 1～25 路。 |
| `layout` | `GoLayout` | 空棋盘 | 初始棋盘布局，必须是 `size × size` 的二维数组。 |
| `player` | `PlayerSign` | `1` | 当前执棋方：`1` 表示黑方，`-1` 表示白方。 |

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
| `move` | `GoBoardMoveEvent` | 合法落子后触发，包含本次落子坐标和落子后的棋盘布局。 |
| `update` | `GoBoardUpdateEvent` | 棋盘状态更新后触发；调用 `play()` 停一手时也会触发。 |

```ts
interface GoBoardUpdateEvent {
  layout: GoLayout;
  player: PlayerSign;
}

interface GoBoardMoveEvent extends GoBoardUpdateEvent {
  position: string;
}
```

坐标使用文本坐标，例如 `A1`、`D4`。坐标会自动去除首尾空格并转为大写；字母 `I` 不参与坐标编号。

事件中的 `layout` 是事件触发时的棋盘布局快照，`player` 是事件发出时规则引擎记录的执棋方。组件会在 `move` 和 `update` 事件发出后切换内部执棋方。

非法坐标、已有棋子的位置和自杀手不会触发事件。

#### Expose 方法

通过模板 `ref` 获取组件实例后，可以调用以下方法：

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `play` | `position?: string` | `boolean` | 在指定坐标落子；不传坐标表示停一手。落子非法时返回 `false`。 |
| `reset` | `options?: GoGameOptions` | `boolean` | 使用新配置重置棋盘；不传参数时恢复最近一次有效配置。配置或布局非法时返回 `false`，并保留当前状态。 |

```ts
import type { GoBoardExposed } from '@go-board/design';

const boardRef = ref<GoBoardExposed>();

boardRef.value?.play('D4');
boardRef.value?.play();
boardRef.value?.reset({ size: 13, player: 1 });
```

## 其他

### @go-board/tool

棋局状态管理与棋盘数据工具，均已在此库中导出，可以直接引入使用。

相关使用方法请查看相应文档：[@go-board/tool](https://github.com/nixwai/go-board/blob/main/packages/utils/README.md)

### @go-board/ui

棋盘 UI 组件库，不含任何逻辑，仅提供基础 UI 组件，适用于自定义开发游戏。

详情请查看：[@go-board/ui](https://github.com/nixwai/go-board/blob/main/packages/ui/README.md)

## 许可证

[MIT](LICENSE)
