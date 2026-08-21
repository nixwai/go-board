# Go Board 项目开发指南

## 项目概览

Go Board 是一个基于 Vue 3 和 TypeScript 的围棋棋盘组件库，使用 pnpm workspace 管理多个内部包、构建工具、演示应用和文档站点。

## 项目结构

- `packages/components`：Vue 组件包 `@go-board/design`。
- `packages/utils`：工具包 `@go-board/tool`。
- `tooling`：组件包和工具包的构建、版本发布与发布工具。
- `playground`：基于 Vite 的本地组件预览应用。
- `docs`：基于 VitePress 的中文文档站点。
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

# 构建文档站点
pnpm docs:build

# 构建 playground
pnpm play:build

# 本地启动文档和 playground
pnpm docs:dev
pnpm play:dev
```

提交代码前，至少运行与改动范围相关的 lint、样式检查、测试和构建命令；涉及文档或 playground 时，同时运行对应构建命令。

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
- VitePress 构建可能提示压缩后 chunk 超过 500 kB。
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
