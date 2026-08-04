# AI 运营 Copilot 实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 员工可用自然语言查询经营数据，获得可追溯 KPI、图表和订单结果，并通过人工审批执行一个低风险写操作。

**文件清单**:
- 创建: `21-the-wild-oasis-website/app/api/ai/admin/route.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/agents/operations-agent.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/tools/operations-tools.ts`
- 创建: `17-the-wild-oasis/src/features/ai-copilot/`
- 创建: `17-the-wild-oasis/src/services/apiAi.js`
- 创建: 员工角色与 AI 审计相关 migration

---

## 任务 1: 打通跨应用身份与只读 AI API

**文件**:
- 创建: admin AI Route Handler
- 创建: 后台 `apiAi.js`
- 创建: 员工角色 migration/RLS policy

**实现**:
```ts
// 后台请求携带 Supabase access token；BFF 服务端验证 token 与 staff role。
// 顾客会话不能调用 admin tools；CORS 只允许明确配置的后台域名。
```

学习前置：JWT、Supabase getUser、RLS、CORS、最小权限和服务端密钥管理。

**验证**:
- 运行: auth integration tests
- 检查: 无 Token、过期 Token、guest role、错误 Origin 均返回拒绝；错误中不泄露敏感配置

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

**验证**:
- 运行: operations tools unit tests
- 检查: 指标与现有 Dashboard 相同口径；日期越界与任意 SQL 输入被拒绝

---

## 任务 3: 构建数据型生成式 UI

**文件**:
- 创建: `CopilotDrawer.jsx`
- 创建: `KpiResult.jsx`、`ChartResult.jsx`、`BookingResult.jsx`、`ToolTimeline.jsx`
- 修改: `AppLayout.jsx` 或 Dashboard 页面加入入口

**实现**:
```ts
type OperationsResult =
  | { type: "kpis"; data: Kpi[]; sourceIds: string[] }
  | { type: "chart"; data: ChartSeries; sourceIds: string[] }
  | { type: "bookings"; data: BookingSummary[]; sourceIds: string[] };
```

**验证**:
- 运行: 后台组件测试和 Playwright
- 检查: 工具状态、图表、表格、空结果、失败与跳转订单详情均可用

---

## 任务 4: 加入单一审批写操作

**文件**:
- 创建: `ApprovalCard.jsx`
- 创建: `addBookingInternalNote` 工具及 migration

**实现**:
```ts
// AI 只能提出内部备注草稿；员工查看 bookingId 与内容后批准或拒绝。
// 拒绝后 Agent 不得重复调用；批准、拒绝和最终执行都进入审计日志。
```

**验证**:
- 运行: approval flow integration test
- 检查: 未批准不会写库；批准后只修改目标订单允许字段；重复请求幂等

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 询问“未来七天有哪些未付款且有特殊需求的到店订单”，再让 AI 草拟一条内部跟进备注
- 确认: 返回真实订单和证据；拒绝审批不写库，批准后只新增一条目标备注

---

## 功能点完成

**最终验证**:
运行: 两端 `npm run check` 与运营 Copilot E2E
检查:
- ✅ 只读工具无任意 SQL 能力
- ✅ guest/admin 权限严格隔离
- ✅ 生成式图表、表格和审批流程可完整演示

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
