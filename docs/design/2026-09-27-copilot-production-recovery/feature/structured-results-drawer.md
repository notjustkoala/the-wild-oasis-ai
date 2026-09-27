# Copilot 结构化结果抽屉实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 将 Copilot 的审批、经营指标、订单列表、AI 解释、工具活动和响应元数据按业务优先级清晰分区；安全渲染 Markdown；消除重复空状态，并确保桌面和 320px 以上移动端无横向溢出。

**文件清单**:
- 创建: `src/features/operations-copilot/CopilotAnswer.tsx`
- 创建: `src/features/operations-copilot/StructuredResults.tsx`
- 修改: `src/features/operations-copilot/CopilotDrawer.tsx`
- 修改: `src/features/operations-copilot/ToolTimeline.tsx`
- 修改: `src/features/operations-copilot/BookingResult.tsx`
- 修改: `src/features/operations-copilot/KpiResult.tsx`
- 修改: `src/features/operations-copilot/ChartResult.tsx`
- 修改: `src/features/operations-copilot/ResponseFeedback.tsx`
- 修改: `tests/OperationsCopilot.test.tsx`
- 修改: `tests/e2e/operations.spec.ts`
- 修改: `package.json`
- 修改: `package-lock.json`

---

## 任务 1: 安全渲染并降级 AI 解释

**文件**:
- 创建: `src/features/operations-copilot/CopilotAnswer.tsx`
- 修改: `src/features/operations-copilot/CopilotDrawer.tsx`
- 修改: `package.json`
- 修改: `package-lock.json`

**实现**:
```tsx
// 使用 react-markdown；设置 skipHtml + unwrapDisallowed，并以 allowedElements 仅允许：
// p, strong, em, ul, ol, li, h1..h4, code, pre, br。
// 不启用 rehype-raw，不允许 a/img，不使用 dangerouslySetInnerHTML。
// 将模型 h1/h2 映射为抽屉内 h3/h4，保持页面标题层级。
// 有结构化 tool output 时放入默认折叠的 <details>“AI explanation”；
// 无结构化结果时直接展示正文。空正文显示单一明确空态。
```

**验证**:
- 运行: `npm test -- --run tests/OperationsCopilot.test.tsx`
- 检查: 标题、粗体和列表成为语义节点，不出现原始 `##`/`**`；script、HTML、图片和链接均不能生成可执行或可导航 DOM；结构化结果存在时解释默认折叠。

---

## 任务 2: 编排业务优先的结构化结果

**文件**:
- 创建: `src/features/operations-copilot/StructuredResults.tsx`
- 修改: `src/features/operations-copilot/CopilotDrawer.tsx`
- 修改: `src/features/operations-copilot/BookingResult.tsx`
- 修改: `src/features/operations-copilot/KpiResult.tsx`
- 修改: `src/features/operations-copilot/ChartResult.tsx`

**实现**:
```tsx
// 固定结果顺序：pending approval -> structured business results -> AI explanation
// -> tool activity -> Continue/feedback/reference footer。
// StructuredResults 按 kind 分组并提供标题：Summary metrics、Arrivals、
// Bookings needing attention、Cabin performance、Policy sources。
// booking 列表为空时不由 BookingResult 各自输出重复文案；编排器合并为
// 一条有语义的空状态。KPI=0 仍是有效数据，必须展示。
// Approval 显示 Pending/decision 状态、Booking #、准确 note 和清晰操作按钮；
// reject/approve 的现有 API 与 toast 行为保持不变。
// Evidence 与 PartialResultWarning 继续存在，不能因折叠或空态合并而丢失。
```

**验证**:
- 运行: `npm test -- --run tests/OperationsCopilot.test.tsx`
- 检查: 审批卡在工具活动之前；多个空 booking 输出只出现一个聚合空态；零值 KPI 仍展示；partial 与 evidence 可访问；Approve/Reject 行为无回归。

---

## 任务 3: 重构抽屉滚动、活动元数据与响应式布局

**文件**:
- 修改: `src/features/operations-copilot/CopilotDrawer.tsx`
- 修改: `src/features/operations-copilot/ToolTimeline.tsx`
- 修改: `src/features/operations-copilot/KpiResult.tsx`
- 修改: `src/features/operations-copilot/ChartResult.tsx`
- 修改: `src/features/operations-copilot/ResponseFeedback.tsx`
- 修改: `tests/e2e/operations.spec.ts`

**实现**:
```tsx
// Drawer 使用 100dvh、固定 header/form 与独立可滚动内容区；桌面 max-width 56rem，
// 小屏 width:100vw、紧凑 padding，Close 保持至少 44x44。
// ToolTimeline 改为 <details>“Data activity · N tools”，成功默认折叠，
// failed/interrupted 默认展开；内部工具名映射为员工可读标签。
// ResponseFeedback 移到 footer，提交后禁用重复反馈；trace/reference 放入
// 可折叠 Response details，并允许长 ID 换行。
// KPI grid 使用 auto-fit/minmax；Chart 小屏改为单列或两列，禁止横向滚动。
// 保留 dialog、aria-describedby、focus trap、Escape 关闭与焦点恢复。
```

**验证**:
- 运行: `npm run test:e2e -- tests/e2e/operations.spec.ts`
- 检查: 桌面与 390x844 viewport 的 `scrollWidth <= clientWidth`；审批卡不会埋在活动轨迹之后；成功活动默认折叠、失败活动展开；键盘焦点与 Escape 行为通过。

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 在 Production 重发中文经营查询，并打开包含 KPI、空 arrivals/risk 及模型说明的结果。
- 确认: 无原始 Markdown；只出现一个业务语义明确的空态；KPI 和审批优先，AI 解释/工具活动/Reference 可发现但不抢占首屏。
- 测试: 在桌面和窄屏打开内部备注草稿，使用键盘完成 Reject/Approve。
- 确认: 没有横向滚动，按钮可触达，关闭后焦点回到启动按钮，决策状态明确显示。

---

## 功能点完成

**最终验证**:
运行: `npm run check`
检查:
- ✅ 编译通过，无 TypeScript 错误
- ✅ 无本次引入的 ESLint 警告
- ✅ 单元测试与桌面/移动端 Copilot E2E 通过

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
