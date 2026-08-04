# AI 选房与预订顾问实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 顾客使用自然语言描述日期、人数、预算和偏好后，获得基于真实库存与价格的推荐，并可一键预填现有预订流程。

**文件清单**:
- 创建: `21-the-wild-oasis-website/app/api/ai/concierge/route.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/agents/concierge-agent.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/tools/cabin-tools.ts`
- 创建: `21-the-wild-oasis-website/app/_ai/schemas/concierge.ts`
- 创建: `21-the-wild-oasis-website/app/_components/ai/ConciergePanel.tsx`
- 创建: 推荐卡、比较表、工具状态和错误恢复组件
- 修改: `ReservationContext.js` 与房型列表/详情页入口

---

## 任务 1: 学会并建立最小流式 AI 链路

**文件**:
- 创建: `app/api/ai/concierge/route.ts`
- 创建: `app/_ai/agents/concierge-agent.ts`

**实现**:
```ts
// 使用实施时最新 AI SDK 文档中的 ToolLoopAgent 与流式 UI 协议。
// 模型通过 AI Gateway 配置；模型 ID 在实施当天查询，不写死计划阶段的旧 ID。
```

学习前置：system/user/tool 消息、Token 与上下文、流式响应、AbortSignal、ToolLoopAgent、服务端密钥边界。

**验证**:
- 运行: 顾客端 `npm run dev`
- 检查: 能发送消息、看到增量内容、停止生成并在失败后重试

---

## 任务 2: 实现真实库存工具而非让模型猜测

**文件**:
- 创建: `app/_ai/schemas/concierge.ts`
- 创建: `app/_ai/tools/cabin-tools.ts`
- 复用: `app/_lib/data-service.js`

**实现**:
```ts
type SearchAvailableCabinsInput = {
  startDate: string;
  endDate: string;
  guests: number;
  maxTotalPrice?: number;
  preferences?: string[];
};

// 工具集合：searchAvailableCabins、getCabinDetails、compareCabins、getHotelPolicy。
// 日期冲突、容量、折扣和总价全部由代码/SQL计算，结果带 cabinId 与数据来源。
```

**验证**:
- 运行: `npm run test -- cabin-tools`
- 检查: 已占用日期不会被推荐；人数和预算硬约束 100% 满足；模型不能改变工具计算的价格

---

## 任务 3: 构建生成式推荐 UI

**文件**:
- 创建: `app/_components/ai/ConciergePanel.tsx`
- 创建: `CabinRecommendationCard.tsx`、`CabinComparison.tsx`、`ToolStatus.tsx`
- 修改: `app/cabins/page.js` 或布局级入口

**实现**:
```ts
type ConciergePart =
  | { type: "text"; text: string }
  | { type: "tool-search"; state: "input" | "output" | "error" }
  | { type: "recommendations"; cabins: CabinRecommendation[] }
  | { type: "reservation-draft"; draft: ReservationDraft };
```

- UI 明确展示查询中、找到结果、无库存、工具失败和请求取消状态。
- 桌面端可使用侧栏，移动端使用底部面板；保留键盘与屏幕阅读器可用性。

**验证**:
- 运行: 组件测试与 Playwright 顾客流程
- 检查: 文本、工具和卡片按流式状态正确切换；无结果时给出修改条件入口

---

## 任务 4: 与现有预订流程闭环

**文件**:
- 修改: `app/_components/ReservationContext.js`
- 修改: `app/_components/DateSelector.js`
- 复用: `app/_lib/actions.js` 中 `createBooking`

**实现**:
```ts
type ReservationDraft = {
  cabinId: number;
  startDate: string;
  endDate: string;
  numGuests: number;
};

// “采用方案”只更新前端预订草稿；最终创建订单仍由用户在现有表单确认。
```

**验证**:
- 运行: Playwright `concierge-to-booking.spec.ts`
- 检查: 推荐结果可预填日期和人数；用户仍能修改；没有用户确认不会创建订单

---

## 任务 5: 建立第一批 30 条功能 Eval

**文件**:
- 创建: `tests/ai/concierge-cases.json`
- 创建: `tests/ai/concierge.eval.ts`

**实现**:
```json
{"case":"family-budget","expectedTools":["searchAvailableCabins"],"hardConstraints":["capacity","availability","budget"]}
```

覆盖正常需求、信息缺失、日期冲突、预算不足、人数超限、Prompt Injection 和取消生成。

**验证**:
- 运行: `npm run test:ai -- concierge`
- 检查: 硬约束测试全部通过；记录工具选择正确率但不在达到稳定值前写入简历

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 输入“一家四口、下周末三晚、预算 1200 美元、需要无麸质早餐”
- 确认: UI 展示实时可用房型、真实总价、推荐理由并可预填预订；整个流程 90 秒内完成

---

## 功能点完成

**最终验证**:
运行: 顾客端 `npm run check` 与 `npm run test:ai -- concierge`
检查:
- ✅ 构建通过，无本次引入的 TypeScript 和 ESLint 错误
- ✅ 真实库存和价格是唯一事实来源
- ✅ 流式、取消、重试、无结果和预订预填均可演示

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
