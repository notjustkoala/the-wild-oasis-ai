# Resume Bullet Drafts

这些 bullet 只使用 [AI Evaluation Report](AI_EVAL_REPORT.md) 中可追溯的数字。面试时应主动说明离线、fixture、真实模型、开发数据库与生产证据的差异。

## 中文

- 基于 Next.js、Vercel AI SDK、React/Vite 与 Supabase 构建双端 AI 住宿平台，将自然语言日期/人数/预算约束转换为实时库存工具调用和生成式推荐 UI，同时把最终预订保留在受信服务端流程中。
- 构建权限感知运营 Copilot，以 5 个有界只读工具呈现 KPI、图表、订单卡与证据 ID，并为唯一的内部备注写动作实现显式人工批准/拒绝、幂等审计和字段白名单。
- 建立 69 条固定离线 Eval：工具选择 45/45、硬约束 69/69、引用 24/24、授权 64/64；另对 10 个真实模型固定场景分批取得通过，首批测得 P50 7.807 秒、P95 20.264 秒，并保留失败与补验报告。
- 为 3 个 AI 入口实现隐私最小化 tracing、签名反馈、限流/超时与非 AI 降级；开发数据库并发探针验证 5 请求中 2 个允许、3 个拒绝且 0 测试 bucket 残留。

## English

- Built a two-surface AI hospitality platform with Next.js, the Vercel AI SDK, React/Vite, and Supabase, translating natural-language stay constraints into live inventory tools and generative recommendation UI while keeping booking creation in a trusted server flow.
- Built a permission-aware operations copilot with five bounded read tools for KPI, chart, booking-card, and evidence views, plus explicit human approval/rejection and idempotent auditing for its sole allow-listed note mutation.
- Established a 69-case deterministic evaluation suite (45/45 tool-selection, 69/69 hard-constraint, 24/24 citation, and 64/64 authorization checks) and preserved batch-level evidence for ten fixed real-model scenarios; the initial run measured 7.807 s P50 and 20.264 s P95.
- Instrumented three AI surfaces with privacy-minimized tracing, signed feedback, rate limits, timeouts, and non-AI fallbacks; a development-database concurrency probe admitted 2 of 5 requests, rejected 3, and left zero test buckets.

## 面试限定语

- “100%”只描述固定离线断言，不是模型准确率。
- 真实模型首次是 8/10；两个失败分别补验通过，不能说单次 10/10。
- 浏览器 5/5 是 HTTP fixture；数据库限流是开发项目；尚没有生产可用性数据。
- 成本没有经核验价格文件，因此为 unknown/未测。
