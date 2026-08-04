# 订单风险识别与入住 Briefing 实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 将订单留言中的过敏、晚到、宠物、纪念日和加床等需求转换为可追溯、可缓存、可人工纠错的运营信息。

**文件清单**:
- 创建: `21-the-wild-oasis-website/supabase/migrations/*_booking_ai_insights.sql`
- 创建: `21-the-wild-oasis-website/app/api/ai/booking-insight/[bookingId]/route.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/schemas/booking-insight.ts`
- 创建: `17-the-wild-oasis/src/features/booking-insights/`
- 修改: `BookingDataBox.jsx`、`TodayActivity.jsx` 或其子组件

---

## 任务 1: 设计结构化输出与缓存表

**文件**:
- 创建: Supabase migration
- 创建: `app/_ai/schemas/booking-insight.ts`

**实现**:
```ts
type BookingInsight = {
  summary: string;
  riskTags: Array<"food-allergy" | "late-arrival" | "pet" | "celebration" | "extra-bed" | "other">;
  severity: "low" | "medium" | "high";
  actionItems: string[];
  confidence: number;
};
```

表字段至少包含 booking_id、结果 JSON、model、prompt_version、source_hash、status、created_at、reviewed_at 和 reviewer_feedback。

**验证**:
- 运行: migration dry run 与 Schema 单元测试
- 检查: 非法 tag、越界 confidence、空 action item 会被拒绝；booking_id 唯一

---

## 任务 2: 实现不阻塞订单的幂等分析服务

**文件**:
- 创建: `app/api/ai/booking-insight/[bookingId]/route.ts`
- 创建: 对应服务与测试

**实现**:
```ts
// source_hash 未变化且已有成功结果时直接返回缓存。
// AI 失败只写入 failed 状态，不修改 bookings，不影响顾客原始预订。
// MVP 采用后台按需生成；批量预生成放到后续优化。
```

学习前置：结构化输出、幂等、内容 Hash、超时与重试、PII 最小化。

**验证**:
- 运行: API 测试
- 检查: 重复请求不会重复计费；失败可重试；无权限用户不能查看其他订单洞察

---

## 任务 3: 在后台渲染风险与入住摘要

**文件**:
- 创建: `src/features/booking-insights/BookingInsightCard.jsx`
- 创建: `src/features/booking-insights/useBookingInsight.js`
- 修改: `src/features/bookings/BookingDataBox.jsx`
- 修改: 今日入住相关组件

**实现**:
```js
// 展示原文、AI 摘要、严重度、风险标签、待办、生成状态和“重新分析/纠错”入口。
// 不以颜色作为唯一风险提示，标签需包含文本。
```

**验证**:
- 运行: 后台组件测试
- 检查: loading、cached、failed、empty、reviewed 状态均可渲染；原始留言始终可见

---

## 任务 4: 加入人工反馈闭环

**文件**:
- 创建: 洞察反馈 API/服务
- 修改: BookingInsightCard

**实现**:
```ts
type InsightFeedback = {
  verdict: "correct" | "partially-correct" | "incorrect";
  correctedTags?: string[];
  note?: string;
};
```

**验证**:
- 运行: 权限与输入验证测试
- 检查: 只有员工可提交；反馈与原 AI 结果同时保留，可用于后续 Eval

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 分别打开含无麸质过敏、午夜到达、宠物、纪念日和空留言的订单
- 确认: 风险分级符合常识，行动项可执行，员工能查看原文并纠正 AI

---

## 功能点完成

**最终验证**:
运行: 两端相关 `npm run test` 与 `npm run build`
检查:
- ✅ 分析失败不影响预订和后台主流程
- ✅ 结果可缓存、可追溯、可纠错
- ✅ PII 不进入日志或公开错误信息

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
