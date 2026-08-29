# AI 运营 Copilot 实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

---
**开发状态**: ✅ 已完成
**对齐检查**: 2026-08-29
**实际实现说明**: 与业务目标一致；默认直连 Gemini，Admin 使用 JSON 聚合响应；采用中英文受控运营语法、严格 PII 脱敏、稳定分页与人工审批；自动化验证为 Vitest 集成测试，端到端流程已人工验收
---

**目标**: 员工可用自然语言查询经营数据，获得可追溯 KPI、图表和订单结果，并通过人工审批执行一个低风险写操作。

**支持边界**: 当前自然语言入口支持经过本地 allowlist grammar 验证的中英文运营问法、明确日期范围和 numeric bookingId。姓名、联系方式、自由备注和 raw observations 不进入模型；未知自由文本及非 Latin/Han 脚本默认 fail closed，并提示改用受支持语法或 numeric bookingId。

**文件清单**:
- 创建: `21-the-wild-oasis-website/app/api/ai/admin/route.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/agents/operations-agent.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/operations-tools.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/operations-{auth,cors,request,types,approval}.ts`
- 创建: `21-the-wild-oasis-website/app/api/ai/admin/approval/route.ts`
- 创建: `17-the-wild-oasis/src/features/operations-copilot/`
- 创建: `17-the-wild-oasis/src/services/apiOperationsCopilot.ts`
- 创建: 三个追加式 migration：审批/审计结构、Advisor/RLS 优化、Reject 审计修复
- 创建: 两端 Operations Copilot Vitest 测试

---

## 任务 1: 打通跨应用身份与只读 AI API

**文件**:
- 创建: admin AI Route Handler
- 创建: 后台 `apiOperationsCopilot.ts`
- 创建: 员工角色 migration/RLS policy

**实现**:
```ts
// 后台请求携带 Supabase access token；BFF 服务端验证 token 与 app_metadata.role。
// 顾客会话不能调用 admin tools；CORS 只允许明确配置的后台域名。
// admin/staff 角色由 Supabase Auth app_metadata 分配；migration 负责 RLS 与审批权限，不创建 Auth 用户。
```

学习前置：JWT、Supabase getUser、RLS、CORS、最小权限和服务端密钥管理。

**验证**:
- 运行: auth integration tests
- 检查: 无 Token、过期 Token、guest role、错误 Origin 均返回拒绝；错误中不泄露敏感配置

**实际响应方式**:
- Admin 客户端请求 `application/json`，Agent 完成后一次性返回类型化 steps 与结果；生成期间展示 loading，完成后展示 ToolTimeline。
- BFF 同一路由保留 AI SDK 流式响应分支，作为后续实时工具状态 UI 的扩展能力。
- 模型默认直连 Gemini Developer API；AI Gateway 保留为可选配置。

---

## 任务 2: 实现固定经营查询工具

**文件**:
- 创建: `operations-tools.ts`
- 创建: 必要的 Supabase RPC/migration

**实现**:
```ts
// getArrivals、getBookingMetrics、getCabinPerformance、getBookingRisks、getBookingDetails
// 每个工具有有限参数、日期范围上限、稳定 JSON 返回值和 sourceIds。
// 禁止把模型文本转换为任意 SQL 执行。
```

- `getBookingMetrics` 与 `getCabinPerformance` 以 500 行稳定分页，最多扫描 2,000 行；超过上限明确返回 `truncated=true`。
- `getBookingRisks` 按 `startDate + id` 稳定分页扫描候选订单，再在服务端派生风险标签并返回前 100 个风险结果；raw observations 不进入返回值或模型上下文。
- 指标沿用 Dashboard 口径：按 `created_at`，包含 cancelled；`totalRevenue` 只汇总已包含 extras 的 `totalPrice`，`extrasRevenue` 单独展示。

**验证**:
- 运行: operations tools unit tests
- 检查: 指标与现有 Dashboard 相同口径；日期越界与任意 SQL 输入被拒绝

---

## 任务 3: 构建数据型生成式 UI

**文件**:
- 创建: `CopilotDrawer.tsx`
- 创建: `KpiResult.tsx`、`ChartResult.tsx`、`BookingResult.tsx`、`ToolTimeline.tsx`
- 创建: `Evidence.tsx`、`PartialResultWarning.tsx`
- 修改: `AppLayout.jsx` 或 Dashboard 页面加入入口

**实现**:
```ts
type OperationsResult =
  | { kind: "booking-metrics"; metrics: BookingMetrics; facts: string[]; sourceIds: string[]; truncated: boolean }
  | { kind: "cabin-performance"; cabins: CabinPerformance[]; facts: string[]; sourceIds: string[]; truncated: boolean }
  | { kind: "arrivals" | "booking-risks" | "booking-details"; facts: string[]; sourceIds: string[]; truncated: boolean };
```

- Cabin Performance 明确展示 Revenue、bookings 和 nights，并提供完整可访问标签。
- 所有结构化结果在达到服务端上限时展示 Partial Result 警告；BookingResult 可跳转订单详情。
- Drawer 支持 label、打开自动聚焦、Escape、Tab/Shift+Tab focus trap 与关闭后焦点恢复。

**验证**:
- 运行: 后台组件测试、API 客户端契约测试与人工 E2E
- 检查: 工具状态、图表、表格、空结果、失败与跳转订单详情均可用

**验证说明**: Feature 03 未建立 Playwright 自动化；相关端到端路径已由人工完成查询、订单跳转、Reject 与 Approve 验收。Playwright 自动化留到后续评测/可观测阶段。

---

## 任务 4: 加入单一审批写操作

**文件**:
- 修改: `CopilotDrawer.tsx`，内联审批区域
- 创建: `app/api/ai/admin/approval/route.ts`
- 创建: `addBookingInternalNote` 工具及 migration

**实现**:
```ts
// AI 只能提出内部备注草稿；员工查看 bookingId 与内容后批准或拒绝。
// 拒绝后 Agent 不得重复调用；批准、拒绝和最终执行都进入审计日志。
```

- 审批请求与决策均要求当前 actor 所有权；决策带 header/body 双重幂等键。
- 三个 migration 按追加顺序保留已应用历史：主审批/审计结构、索引与 RLS Advisor 优化、Reject 审计事件修复。
- 批准只更新 `bookings.internalNote`；拒绝不更新 booking 字段。

**验证**:
- 运行: approval flow integration test
- 检查: 未批准不会写库；批准后只修改目标订单允许字段；重复请求幂等

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 询问“未来七天有哪些未付款且有特殊需求的到店订单”，再让 AI 草拟一条内部跟进备注
- 确认: 返回真实订单和证据；拒绝审批不写库，批准后只新增一条目标备注

**验收结果（2026-08-27）**: ✅ 已通过。自然语言查询返回真实订单并可跳转详情；Reject 审计为 rejected 且没有 executed 事件；Approve 仅新增目标订单内部备注。

---

## 功能点完成

**最终验证**:
运行: 两端 `npm run check`、Feature 03 聚焦测试与人工运营 Copilot E2E
检查:
- ✅ 只读工具无任意 SQL 能力
- ✅ guest/admin 权限严格隔离
- ✅ 生成式图表、表格和审批流程可完整演示

**最终结果（2026-08-29）**:
- Customer: lint、typecheck、23 个测试文件 / 330 tests、Next production build 全部通过。
- Admin: lint、typecheck、8 个测试文件 / 62 tests、Vite production build 全部通过。
- 规格审查与独立代码质量审查均为 APPROVED，Critical / Important / Minor 均为 0。
- 主 migration SHA256 保持 `108A5CE8C2E1B9C5894B1EDD8997E54AE946E83E9B3C0C8934F286A19152EA16`；原始工作树和数据库未被修改。

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
