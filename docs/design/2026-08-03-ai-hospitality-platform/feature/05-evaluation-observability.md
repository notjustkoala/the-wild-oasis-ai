# 评测、可观测与安全加固实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 用可重复测试、运行轨迹和安全用例证明 AI 功能可靠，而不是只展示几次成功对话。

**文件清单**:
- 创建: `21-the-wild-oasis-website/tests/ai/fixtures/`
- 创建: `21-the-wild-oasis-website/tests/ai/evals/`
- 创建: `ai_runs`、`ai_feedback` migration
- 创建: 内部 Eval 报告页面或静态报告生成脚本
- 修改: 各 Agent 的 step/tool lifecycle callbacks

---

## 任务 1: 分层建立确定性测试

**文件**:
- 创建: 工具单元测试、Agent Mock 测试、两端 UI 流测试

**实现**:
```ts
// L1: 纯函数与 SQL/RPC 结果
// L2: AI SDK Mock Provider 的工具选择和流式消息
// L3: 少量真实模型 Eval
// L4: Playwright 端到端关键路径
```

学习前置：非确定性测试、Mock Language Model、fixture、property/edge-case testing。

**验证**:
- 运行: `npm run test`、`npm run test:e2e`
- 检查: 普通 CI 默认不调用付费模型；测试结果可重复

---

## 任务 2: 扩展为 50–100 条 Eval 数据集

**文件**:
- 创建: `tests/ai/fixtures/*.jsonl`
- 创建: Eval runner 与报告器

**实现**:
```ts
type EvalCase = {
  id: string;
  surface: "concierge" | "operations" | "rag";
  input: string;
  expectedTools?: string[];
  forbiddenTools?: string[];
  hardConstraints?: string[];
  expectedCitationIds?: string[];
};
```

至少覆盖：信息缺失、约束冲突、无结果、恶意提示、越权访问、审批拒绝、工具错误、取消和多轮修改需求。

**验证**:
- 运行: `npm run eval:ai`
- 检查: 输出工具选择正确率、硬约束满足率、引用命中率、越权阻断率和失败样本列表

---

## 任务 3: 建立最小可观测链路

**文件**:
- 创建: `ai_runs`/`ai_feedback` migration
- 修改: Agent callbacks

**实现**:
```ts
type AiRunMetrics = {
  surface: string;
  status: string;
  durationMs: number;
  timeToFirstTokenMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  toolNames: string[];
  promptVersion: string;
};
```

日志不保存 National ID、完整邮箱、原始 Access Token 或未经脱敏的自由文本；错误对用户友好，对内部保留 traceId。

**验证**:
- 运行: 10 次固定场景并生成报告
- 检查: 能查看成功率、P50/P95 延迟、Token/成本、工具错误和用户反馈

---

## 任务 4: 完成安全与降级策略

**文件**:
- 修改: API rate limit、超时、错误映射、Prompt 与工具边界
- 创建: security Eval cases

**实现**:
```ts
// 安全原则：输入不是权限；模型输出不是授权；工具本身再次校验身份、参数和资源归属。
// 降级：模型不可用时保留普通筛选、预订和运营后台原功能。
```

**验证**:
- 运行: security tests
- 检查: 所有越权和未审批写操作均为 0 次成功；限流与模型失败不破坏核心业务

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 查看一次成功、一次无结果、一次模型超时和一次越权请求的完整 UI 与追踪
- 确认: 用户能理解发生了什么；管理员能根据 traceId 定位问题；日志没有明显 PII

---

## 功能点完成

**最终验证**:
运行: `npm run check`、`npm run eval:ai`、安全 E2E
检查:
- ✅ 固定 Eval 生成可保存的真实指标报告
- ✅ 越权与未审批写操作阻断率 100%
- ✅ 模型不可用时非 AI 核心业务仍可工作

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
