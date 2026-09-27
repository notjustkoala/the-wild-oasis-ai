# Copilot 中文请求与隐私安全备注管线实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 常用中文经营查询不再被安全清洗器误降级；“本月”由服务端解析为确定日期范围；内部备注原文只保留在受信服务端绑定中，AI 模型永远只看到订单号和 `[redacted]`，审批卡仍能显示员工输入的准确备注。

**文件清单**:
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-request.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-types.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/agents/operations-agent.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-tools.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/api/ai/admin/route.ts`
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/operations-route-security.test.ts`
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/operations-tools.test.ts`
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/generation-observability-route.test.ts`

---

## 任务 1: 修复窄范围中文安全语法与确定日期

**文件**:
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-request.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-types.ts`
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/operations-route-security.test.ts`

**实现**:
```ts
// 仅增加完整且已知安全的经营查询短语，不允许任意 Han 字符通过。
// 覆盖生产失败句中的“对比 / 入住相关订单 / 并列出 / 需要关注的订单”。
// 相邻姓名、邮箱、电话和自由文本继续被脱敏或失败关闭。

// resolveRelativeOperationsDateRange 新增：
// “this month” / “本月” => referenceDate 所在 UTC 月的第一天至最后一天。
// 例如 2026-09-27 => 2026-09-01..2026-09-30。
```

**验证**:
- 运行: `npm test -- --run tests/ai/operations-route-security.test.ts`
- 检查: 生产失败原句保持经营意图并附加确定日期提示；闰年二月正确；插入中文姓名的对抗样例仍被脱敏或降级；既有多语种隐私测试无回归。

---

## 任务 2: 在模型上下文之外绑定准确备注

**文件**:
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-request.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/agents/operations-agent.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/_ai/operations-tools.ts`
- 修改: `../21-the-wild-oasis-website-ai/app/api/ai/admin/route.ts`

**实现**:
```ts
type RequestedInternalNoteDraft = {
  bookingId: number;
  note: string;
};

// readOperationsRequest 只从最后一条原始 user 文本中，用严格锚定的中英文命令格式
// 提取 bookingId 与 1..500 字符备注；只 trim 外围空白，保留内部换行。
// uiMessages 仍使用现有脱敏结果：bookingId=<id>: [redacted]。
// 原始备注不得参与日期提示、模型消息、prompt、tool-call input 或 observability。

// createOperationsAgent/createOperationsTools 通过服务端闭包接收绑定草稿。
// admin route 只把 readOperationsRequest 返回的服务端绑定传给 agent factory，
// 不把它合并进 convertToModelMessages、响应日志或可观测性属性。
// addBookingInternalNote 的模型输入 schema 只保留 bookingId。
// execute 必须同时满足：存在绑定草稿且 bookingId 精确匹配；否则在 RPC 前失败。
// 实际 createOperationsApproval 使用闭包中的准确 note。
// prepareStep 对已绑定草稿强制且仅执行一次 addBookingInternalNote，随后停止写工具循环。
// tool.toModelOutput 仅返回无备注、无 approvalId 的安全摘要；原始 tool result
// 仍返回给已认证 Staff UI，以便审批卡展示准确备注。
```

**验证**:
- 运行: `npm test -- --run tests/ai/operations-route-security.test.ts tests/ai/operations-tools.test.ts`
- 检查: 每一次 mock model 调用序列化内容都不含原始备注；RPC 收到准确备注；JSON tool result 向已认证 UI 返回准确备注；错误订单号、无绑定草稿、空备注、超长备注和畸形命令均在写入前失败。

---

## 任务 3: 保持审批、审计与可观测性边界

**文件**:
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/generation-observability-route.test.ts`
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/operations-route-security.test.ts`
- 修改: `../21-the-wild-oasis-website-ai/tests/ai/operations-tools.test.ts`

**实现**:
```ts
// 不修改数据库 schema、审批 RPC 或授权模型。
// ai_runs 继续只记录 allow-listed tool name、状态、token 与时延；不得记录备注正文。
// 审批审计继续只记录 note_length 等既有元数据，不新增原文日志。
// 保持“draft 不改 booking；reject 不执行；approve 只改 internalNote；重复决策幂等”。
```

**验证**:
- 运行: `npm run test:ai`
- 检查: 模型上下文、trace 与审计载荷不含备注原文；Reject 后订单不变；Approve 后仅 `internalNote` 改变；同一审批不能重复执行。

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 以 `DEMO_STAFF` 重新发送“对比本月入住相关订单和收入，并列出需要关注的订单。”。
- 确认: 不再出现 bookingId fallback；日期固定为系统参考日期所在月；返回指标、到店与风险工具结果。
- 测试: 为合成订单 `699` 草拟一条新的、非敏感内部备注，先 Reject，再重新草拟并 Approve。
- 确认: 审批卡显示原始备注而不是 `[redacted]`；Reject 不改订单；Approve 仅写入 `internalNote`；模型/trace 不暴露备注正文。

---

## 功能点完成

**最终验证**:
运行: `npm run check`
检查:
- ✅ 编译通过，无 TypeScript 错误
- ✅ 无本次引入的 ESLint 警告
- ✅ 全量 AI 安全、审批与可观测性测试通过

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
