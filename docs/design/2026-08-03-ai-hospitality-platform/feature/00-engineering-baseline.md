# 工程基线与演示数据实施步骤

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 在不大规模重写现有业务的前提下，建立可持续添加 AI 功能的构建、类型、测试、数据和文档基线。

**文件清单**:
- 创建: `21-the-wild-oasis-website/tsconfig.json`
- 创建: `21-the-wild-oasis-website/supabase/migrations/`
- 创建: `21-the-wild-oasis-website/scripts/generate-demo-data.mjs`
- 创建: 两端 Vitest 配置与最小测试目录
- 修改: 两端 `package.json`、`.gitignore`、ESLint 配置
- 修改: `21-the-wild-oasis-website/app/_lib/actions.js`、`ReservationForm.js`、`DateSelector.js`
- 修改: `17-the-wild-oasis/src/services/supabase.js`、`useRecentBookings.js`
- 删除: `21-the-wild-oasis-website/app/api/debug-env/route.js`
- 整理: `17-the-wild-oasis/src/features/cabins/` 中未使用的 v1/v2 文件

---

## 任务 1: 固定当前质量基线

**文件**:
- 修改: 两端 `package.json`
- 修改: `17-the-wild-oasis/.eslintignore` 或 ESLint ignore 配置

**实现**:
```json
{
  "scripts": {
    "test": "vitest run",
    "check": "npm run lint && npm run test && npm run build"
  }
}
```

- 后台 lint 只检查源代码，不扫描生成的 `dist`。
- 记录初始 bundle 大小、lint warning、Lighthouse 结果，后续只与该基线比较。
- 顾客端使用本地字体或确保 CI 可访问字体资源，避免构建依赖不稳定的外网下载。
- 将后台 Supabase URL/anon key 移到环境变量并补充 `.env.example`；检查现有 RLS 后再开放演示账号。
- 删除 debug-env 路由，避免生产环境回显配置元数据。

**验证**:
- 运行: 两端 `npm run lint`、`npm run test`、`npm run build`
- 检查: 命令可重复执行；输出不受上一次生成目录影响

---

## 任务 2: 渐进引入 TypeScript 与测试

**文件**:
- 创建: 两端 `vitest.config.*`、`tests/setup.*`
- 创建: 顾客端 `tsconfig.json`
- 修改: Vite 配置以支持新 `.ts/.tsx` 模块

**实现**:
```ts
// 迁移边界：新 AI API、Schema、工具和生成式 UI 使用 TypeScript。
// 现有稳定 JSX 组件不为“统一格式”而一次性迁移。
export type AiSurface = "concierge" | "operations";
```

学习前置：TypeScript narrowing、discriminated union、泛型、Zod parse/safeParse、组件测试和网络 Mock。

**验证**:
- 运行: 两端 `npm run test`
- 检查: 至少各有一个组件测试和一个数据服务测试；新 TypeScript 文件进入类型检查

---

## 任务 3: 建立可复现的业务数据

**文件**:
- 创建: `21-the-wild-oasis-website/scripts/generate-demo-data.mjs`
- 创建: `21-the-wild-oasis-website/supabase/seed.sql` 或等价受控种子文件

**实现**:
```js
const DEMO_SEED = 20260803;
const DEMO_MONTHS = 12;
const BOOKING_COUNT = 800;
```

- 生成季节性入住、价格、提前预订天数、取消、早餐和特殊需求数据。
- 特殊需求包含过敏、晚到、宠物、纪念日、加床、无需求和恶意 Prompt 等固定测试样本。
- 仅操作演示环境；执行前显示目标 Supabase 项目，生产环境默认拒绝。

**验证**:
- 运行: `npm run seed:demo -- --dry-run`
- 检查: 相同 seed 产生相同统计分布；不会默认写入远端生产库

---

## 任务 4: 统一价格口径并保证最终下单可信

**文件**:
- 创建: 顾客端共享价格/日期领域函数
- 修改: `ReservationForm.js`、`DateSelector.js`、`app/_lib/actions.js`
- 修改: `app/_lib/data-service.js`

**实现**:
```ts
// 唯一价格口径：total = nights * (regularPrice - discount)。
// createBooking 只信任 cabinId/date/guest 输入；服务端重新查询房型价格、容量和区间占用后再计算并写库。
```

- 将“查询可用性 + 创建订单”尽量放入数据库事务/RPC，防止 AI 推荐后库存被其他用户抢占。
- 修复 `useRecentBookings` 错误调用 stays 查询造成的指标语义混乱，并为统计口径加测试。

**验证**:
- 运行: 价格、区间重叠和并发预订测试
- 检查: UI 显示、AI 工具、Server Action 与数据库写入价格完全一致；冲突订单无法创建

---

## 任务 5: 清理课程痕迹并拆分后台路由

**文件**:
- 修改: `17-the-wild-oasis/src/App.jsx`
- 整理: 未被 import 的 `* v1.jsx`、`* v2.jsx`
- 修改: 两端 README 的基础运行说明

**实现**:
```js
// 页面级 React.lazy + Suspense；只延迟加载路由页面，不拆碎基础 UI 组件。
```

**验证**:
- 运行: 后台 `npm run build`
- 检查: 产生多个路由 chunk；入口包较当前约 917 KB 明显下降；没有未使用旧文件警告

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 从干净安装启动两个项目，登录并完成一次预订、入住和退房
- 确认: 原功能无回归；演示数据看起来具有季节性和真实业务差异

---

## 功能点完成

**最终验证**:
运行: 两端 `npm run check`
检查:
- ✅ 两端构建、lint、测试可重复通过
- ✅ 新 AI 模块具备 TypeScript 与 Zod 基线
- ✅ 演示数据可复现且不会误写生产库
- ✅ 服务端重新校验库存、容量和价格，前端输入不是最终事实来源

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
