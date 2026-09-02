# Go Board

基于 Vue 3 和 TypeScript 的围棋棋盘组件库。`@go-board/design` 当前公开提供 `GoBoard`、`GoSave`、`GoHistoryButton` 和 `GoHistorySlider` 组件，并重新导出 `@go-board/tool` 的围棋规则类型、状态管理器与工具函数。

## 特性

- 提供可直接使用的围棋棋盘组件。
- 支持 1～25 路棋盘，默认 19 路。
- 支持初始化棋盘布局、当前执棋方和劫点信息。
- 支持鼠标悬停预览、点击落子、提子、自杀手和立即回提校验。
- 支持标记最近一次落子，并可禁用全部棋盘交互。
- 支持通过模板引用调用落子、停一手和重置方法。
- 支持通过 `GoSave` 保存、加载和浏览棋局历史，并支持受控的 `v-model:value`。
- 提供历史记录控制按钮和滑动输入条，可与 `GoSave` 组合使用。
- 支持单组件导入或全量注册。
- 支持 TypeScript 类型导出和原生 DOM 属性透传。

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
  GoGameSnapshot,
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

function handleMove(event: GoGameSnapshot) {
  console.log('落子位置：', event.latestVertex);
  console.log('落子后的棋盘：', event.layout);
  console.log('下一执棋方：', event.player);
}

function handleUpdate(event: GoGameSnapshot) {
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

### 历史记录示例

`GoSave` 作为容器包裹 `GoBoard` 及历史控制组件后，会自动保存落子快照，并在切换历史记录时同步棋盘；也可以通过 `v-model:value` 读取或替换全部历史快照。

```vue
<script setup lang="ts">
import type { GoGameOptions } from '@go-board/design';

import { GoBoard, GoHistoryButton, GoHistorySlider, GoSave } from '@go-board/design';
import { ref } from 'vue';

const history = ref<GoGameOptions[]>([]);
</script>

<template>
  <GoSave v-model:value="history">
    <GoBoard :init="{ size: 9 }" aria-label="九路围棋棋盘" />
    <GoHistorySlider aria-label="棋局历史" />
    <GoHistoryButton :step="-1">后退</GoHistoryButton>
    <GoHistoryButton :step="1">前进</GoHistoryButton>
    <GoHistoryButton :step="0">清空</GoHistoryButton>
  </GoSave>
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
| `showCoord` | `boolean` | `false` | 是否在棋盘左侧显示从上到下递减的行坐标、下侧显示跳过字母 I 的列坐标。 |
| `init` | `GoGameOptions` | — | 棋局初始化配置，支持 `size`、`layout`、`player`、`ko` 和 `latestVertex`。 |

`GoBoard` 没有独立的 `size` Prop，棋盘路数通过 `init.size` 设置，后续可以通过 `reset({ size })` 修改。

`size` 会被截断并限制在 `1`～`25` 的整数范围；未设置或无效时默认为 `19`。传入组件的原生 DOM 属性、`class`、`style` 会透传到棋盘根元素。

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
| `ko` | `KoInfo` | `undefined` | 初始劫子信息，包含受限方和劫点；不传时表示无劫。 |
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
| `move` | `GoGameSnapshot` | 合法落子后触发，包含 `latestVertex` 及切换执棋方后的完整棋局快照。 |
| `update` | `GoGameSnapshot` | 合法落子、停一手或重置成功后触发，包含最新完整棋局快照；停一手时保留上一手 `latestVertex`。 |


当 `GoBoard` 位于 `GoSave` 默认插槽内时，成功落子会自动保存快照；通过历史组件切换快照后，棋盘会自动同步。停一手只更新棋盘状态，不新增历史快照。

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

### GoSave

存档容器组件，使用 `value` 初始化或受控管理棋局快照列表，并通过默认插槽为子组件提供历史记录上下文。`GoBoard`、`GoHistoryButton` 和 `GoHistorySlider` 放在其默认插槽内时会自动协同工作。

#### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `GoGameOptions[]` | `[]` | 初始化或受控的历史快照列表；组件只复制快照列表，不深拷贝快照对象。 |

#### Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:value` | `GoGameOptions[]` | 历史快照列表变化时触发，可配合 `v-model:value` 使用。 |

#### Expose 方法

| 方法 | 参数 | 返回值 | 说明 |
| --- | --- | --- | --- |
| `save` | `snapshot: GoGameOptions`<br>`position?: number` | `boolean` | 插入快照并丢弃插入位置之后的历史。 |
| `reset` | `snapshot: GoGameOptions` | `boolean` | 清空历史并保存一条新的快照。 |
| `load` | `position: number` | `GoGameOptions \| undefined` | 跳转到指定历史位置。 |
| `forward` | `step?: number` | `GoGameOptions \| undefined` | 向前移动指定步数，默认 1 步。 |
| `backward` | `step?: number` | `GoGameOptions \| undefined` | 向后移动指定步数，默认 1 步。 |
| `clear` | 无 | `void` | 清除全部历史记录。 |
| `onListen` | `listener: GoSaveChangeListener`<br>`onBeforeUnmount: Function` | `() => void` | 注册历史变化监听，并在组件卸载前自动注销。 |

### useGoSave

`useGoSave` 用于在组合式 API 中访问 `GoSave` 的响应式历史状态和操作方法。通常应在 `GoSave` 默认插槽内的子组件中调用，由组合式 API 自动注入最近的存档上下文并在组件卸载前注销监听；也可以传入已有的 `GoSaveInstance`。

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useGoSave } from '@go-board/design';

const {
  isValid,
  version,
  current,
  snapshot,
  snapshotLen,
  backwardSnapshot,
  forwardSnapshot,
  clearSnapshots,
  onSnapshotListen,
} = useGoSave();

const canBackward = computed(() => isValid && current.value > 0);
const canForward = computed(() => (
  isValid && current.value < snapshotLen.value - 1
));

onSnapshotListen((change) => {
  console.log('历史版本：', change.version);
  console.log('当前快照：', change.snapshot);
});
</script>

<template>
  <div>
    <span>{{ current + 1 }} / {{ snapshotLen }}</span>
    <button type="button" :disabled="!canBackward" @click="backwardSnapshot()">
      后退
    </button>
    <button type="button" :disabled="!canForward" @click="forwardSnapshot()">
      前进
    </button>
    <button type="button" :disabled="!snapshotLen" @click="clearSnapshots()">
      清空
    </button>
    <pre v-if="snapshot">{{ snapshot }}</pre>
    <small>历史版本：{{ version }}</small>
  </div>
</template>
```

```vue
<script setup lang="ts">
import HistoryControls from './HistoryControls.vue';
import { GoBoard, GoSave } from '@go-board/design';
</script>

<template>
  <GoSave>
    <GoBoard :init="{ size: 9 }" />
    <HistoryControls />
  </GoSave>
</template>
```

#### 返回值

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `isValid` | `boolean` | 是否获取到可用的 `GoSave` 上下文。 |
| `version` | `Ref<number>` | 历史状态版本；每次有效的历史数据、位置变化或受控重建后递增。 |
| `current` | `Ref<number>` | 当前历史位置；无历史记录时为 `-1`。 |
| `snapshot` | `Ref<GoGameOptions \| undefined>` | 当前历史位置对应的快照。 |
| `snapshotLen` | `Ref<number>` | 当前历史快照数量。 |
| `snapshotList` | `Ref<GoGameOptions[]>` | 当前全部历史快照。 |
| `saveSnapshot` | `(snapshot, position?) => boolean \| undefined` | 保存快照，并丢弃插入位置之后的历史。 |
| `resetSnapshot` | `(snapshot) => boolean \| undefined` | 清空历史并保存唯一快照。 |
| `loadSnapshot` | `(position) => GoGameOptions \| undefined` | 跳转到指定历史位置。 |
| `forwardSnapshot` | `(step?) => GoGameOptions \| undefined` | 向前移动指定步数，默认 1 步。 |
| `backwardSnapshot` | `(step?) => GoGameOptions \| undefined` | 向后移动指定步数，默认 1 步。 |
| `clearSnapshots` | `() => void` | 清除全部历史记录。 |
| `onSnapshotListen` | `(listener: GoSaveChangeListener) => void` | 监听外部历史变化，并自动过滤由当前 `useGoSave` 实例的操作方法主动触发的同一次变更。 |

未获取到 `GoSave` 上下文时，`isValid` 为 `false`，响应式状态使用空历史默认值，操作方法不会修改任何数据。

### GoHistoryButton

历史记录控制按钮，必须放在 `GoSave` 默认插槽内使用。`step` 为正数时前进，为负数时后退，`0` 清空历史；非整数会使按钮禁用。未提供默认插槽内容时，按钮文本按步数显示为“前进”“后退”或“清空”。

#### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 是否禁用按钮。 |
| `step` | `number` | `-1` | 有符号整数步数；正数前进，负数后退，`0` 清空历史。 |

### GoHistorySlider

历史快照滑动输入条，必须放在 `GoSave` 默认插槽内使用。滑块位置对应历史快照的绝对索引；无历史记录时自动禁用。

#### Props

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disabled` | `boolean` | `false` | 是否禁用滑块。 |

`GoHistoryButton` 和 `GoHistorySlider` 会透传原生 DOM 属性、`class`、`style` 及事件，可通过 `aria-label` 或 `aria-labelledby` 补充无障碍名称。
## 其他

### @go-board/tool

棋局状态管理、不可变棋盘规则实例、棋局历史记录、坐标归一化、布局创建与校验工具，均已由 `@go-board/design` 重新导出，可以直接引入使用。

相关使用方法请查看相应文档：[@go-board/tool](https://github.com/nixwai/go-board/blob/main/packages/tool/README.md)

### @go-board/ui

基础棋盘 UI 组件库，负责棋盘绘制、棋子展示、单元格交互和无障碍语义，不负责围棋落子规则与棋局状态管理。

详情请查看：[@go-board/ui](https://github.com/nixwai/go-board/blob/main/packages/ui/README.md)

## 许可证

[MIT](LICENSE)
