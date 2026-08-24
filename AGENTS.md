# Go Board 项目开发指南

## 项目概览

Go Board 是一个基于 Vue 3 和 TypeScript 的围棋棋盘组件库，使用 pnpm workspace 管理多个内部包、构建工具和演示应用。

## 项目结构

- `packages/components`：Vue 组件包 `@go-board/design`。
- `packages/utils`：工具包 `@go-board/tool`。
- `tooling`：组件包和工具包的构建、版本发布与发布工具。
- `playground`：基于 Vite 的本地组件预览应用。
- `dist`：构建生成目录，不提交到版本库。
- `node_modules`：依赖安装目录，不提交到版本库。

## 环境与依赖

- 包管理器：`pnpm`。
- workspace 配置：根目录 `pnpm-workspace.yaml`。
- 安装依赖后，从仓库根目录执行脚本。
- 不要提交 `node_modules`、`dist`、缓存目录或其他构建生成文件。
- workspace 内部依赖使用 `workspace:*`，不要绕过现有 workspace 依赖关系直接复制或重复安装。

## 常用命令

在仓库根目录执行：

```bash
# 代码检查
pnpm lint
pnpm lint:style

# 自动修复代码或样式问题
pnpm lint:fix
pnpm lint:style-fix

# 运行测试
pnpm test -- --run
pnpm coverage

# 构建组件包和工具包
pnpm build


# 构建 playground
pnpm play:build

# 本地启动 playground
pnpm play:dev
```

提交代码前，至少运行与改动范围相关的 lint、样式检查、测试和构建命令；涉及 playground 时，同时运行对应构建命令。

## 组件开发约定

- 组件按功能拆分到 `packages/components/src/<component>` 目录。
- 组件目录通常包含：
  - `src/<component>.ts`：Props 等类型定义。
  - `src/<component>.vue`：组件实现。
  - `index.ts`：组件入口与公开导出。
- Vue 组件使用 `<script setup lang="ts">`。
- 使用 `defineOptions` 声明组件名；需要单组件安装时，使用现有的 `withInstall` 工具包装组件。
- 在组件包的 `src/index.ts` 中导出新增组件。
- 需要全量安装时，在 `src/installer.ts` 的组件列表中注册组件。
- 修改组件时同步维护 Props 类型、组件入口导出、全量安装列表和必要的全局类型声明。
- 保持现有组件导出和安装方式，不引入第二套组件注册机制。

### 组件封装规则

- 封装组件前先明确职责边界：封装组件只负责其公开契约所声明的结构、状态、行为和样式，不复制或接管使用方的业务逻辑。
- 组件应保持单一职责；与组件职责无关的状态管理、数据处理、尺寸校验、业务规则和子元素专属逻辑应留在使用方或独立模块中。
- 抽离容器或基础 UI 时，只抽离与该容器或基础 UI 直接相关的模板、布局、视觉样式、尺寸表现和无障碍语义；业务内容、业务交互和业务专属样式不得无依据地下沉到封装组件。
- 封装组件不得重复实现使用方已经负责的默认值、边界限制、数据归一化或业务校验；通用 UI 组件仅处理自身公开 API 必需的通用逻辑。
- 组件根元素应稳定且明确；需要透传属性时，使用 `defineOptions({ inheritAttrs: false })` 与 Vue 的 `useAttrs()`，将属性显式绑定到约定的根元素，确保原生 DOM 属性、class、style 和事件行为与抽离前一致。
- 不得通过额外包裹层、隐式属性继承或重复声明改变组件的 DOM 层级、属性归属、事件触发目标和无障碍语义，除非这是公开 API 中明确约定的行为。
- 组件 Props、Emits、Slots、Expose 和透传属性应有清晰且最小化的公开契约；不为单一调用场景增加临时 API，不在组件内部依赖未声明的外部状态。
- 内部封装组件默认仅供所属功能使用；除非明确需要对外提供，否则不新增公开导出、全量安装注册或全局类型声明。
- 组件封装或抽离后必须补充回归测试，覆盖根节点渲染、公开 API、关键交互、属性透传、无障碍语义和原有行为不变；涉及视觉或布局时同步执行样式检查。

## 工具函数开发约定

- 每个工具函数使用独立目录，例如 `packages/utils/src/formatKey`。
- 在功能目录的 `index.ts` 中实现并导出函数。
- 在 `packages/utils/src/index.ts` 中汇总公开导出。
- 使用 Vitest 编写与工具函数行为对应的测试，测试文件与实现放在同一功能目录。
- 测试应覆盖正常输入、边界输入和错误或异常输入（当该函数存在对应行为时）。

## 代码与样式规范

- 遵循根目录 `eslint.config.mjs`、`stylelint.config.cjs` 和 `tsconfig.json` 中的现有配置。
- TypeScript 使用严格模式；避免未使用的局部变量和参数。
- Vue、TypeScript、CSS/SCSS 文件分别遵循项目已有的 ESLint 和 Stylelint 检查规则。
- 保持现有格式化、分号、花括号、对象换行和 Vue 模板自闭合规则。
- 样式按现有组件范围维护，避免将局部样式无理由提升为全局样式。
- 优先复用已有工具、构建配置和组件模式，不重复实现已有能力。
- 不随意调整目录结构、包名、公开导出路径或构建产物路径。

## 构建与发布

- `pnpm build` 会并行构建组件包和工具包。
- 组件包相关命令：
  - `pnpm design:build`
  - `pnpm design:release`
  - `pnpm design:publish`
- 工具包相关命令：
  - `pnpm tool:build`
  - `pnpm tool:release`
  - `pnpm tool:publish`
- `release` 命令用于版本发布准备，`publish` 命令用于发布产物。
- 发布命令具有外部影响，仅在确认版本号、构建产物、发布目标和凭据后执行；不将其作为日常验证步骤。

## 已知非阻断提示

- 当前运行 Vitest 可能提示 `vitest.config.ts` 使用 ESM 语法但按 CommonJS 加载的配置警告。
- 上述提示在命令最终成功时不视为本次改动失败；如果出现新的错误、退出码异常或与改动直接相关的警告，应单独调查。

## 变更验证

完成改动后：

1. 运行与改动范围相关的检查命令。
2. 执行 `git diff --check`，确认没有空白字符错误。
3. 使用 `git status --short` 和 `git diff --stat` 核对变更范围。
4. 确认没有修改无关源码、配置、锁文件或项目结构。
5. 确认没有新增子目录级 `AGENTS.md`，除非后续确有局部规则需要覆盖根级指南。

## 提交前检查清单

- [ ] 公开 API 已从正确的入口导出。
- [ ] 组件或工具函数的测试已补充或更新。
- [ ] 已运行相关 lint、样式检查、测试和构建命令。
- [ ] 已执行 `git diff --check`。
- [ ] 未提交生成文件、依赖目录或敏感信息。
- [ ] 变更保持与现有项目结构和实现模式一致。
