# AI Evaluation Report

## 报告原则

本报告只汇总已保存的构建产物。不同证据层不互相替代，所有百分比都同时给出分子、分母和测量方法。报告生成/整理日期为 2026-09-22；没有在 Feature06 重跑付费模型。

## 指标摘要

| 层级 | 数据集 / 环境 | 结果 | 可以证明 | 不能证明 |
| --- | --- | --- | --- | --- |
| 固定离线 Eval | 69 条，seed 5，mock routing + synthetic retrieval | 工具 45/45；硬约束 69/69；引用 24/24；授权 64/64 | 类型化工具与确定性 adapter 契约 | 真实模型准确率、生产 RLS、用户满意度 |
| 真实模型首批 | 10 个固定场景；fixture 业务工具 + 真实开发库 telemetry | 8/10；P50 7807 ms；P95 20264 ms | 当次真实模型行为、延迟与 telemetry | 单次 10/10、生产业务数据、embedding 质量 |
| 失败补验 | `live-05-empty` 与 `live-09-tool-error` 各自独立单场 | 后续分别通过 | 10 个不同固定场景最终分批取得通过 | 首批结果被改写为 10/10 |
| 浏览器 E2E | Guest 5/5 + Staff 5/5，HTTP fixture | success/empty/timeout/denied/recovery | 真实 UI 状态与交互 | 真实模型、真实数据库或生产可用性 |
| 安全 HTTP | 真实路由请求 | 未登录 401、跨源 403、无效 body 400、伪造反馈 403 | 请求边界失败关闭 | WAF、生产配置正确性 |
| 开发数据库限流 | 5 个真实并发 HTTP RPC 请求，limit 2 | 2 允许、3 拒绝、0 测试 bucket 残留 | 数据库限流原子性与清理 | 全球多区域生产流量 |

## 1. 固定离线 Eval

原始报告：[offline.md](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/offline.md) · [offline.json](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/offline.json)

最新保存报告时间为 `2026-09-21T11:43:26.648Z`。Runner 使用固定输入、独立 stay/库存 oracle、生产 policy service 接口与确定性 adapter；它不调用付费模型或远端数据库。

| Metric | Passed | Applicable | Skipped | Rate |
| --- | ---: | ---: | ---: | ---: |
| Tool selection contract | 45 | 45 | 24 | 100.00% |
| Hard constraints | 69 | 69 | 0 | 100.00% |
| Citations | 24 | 24 | 45 | 100.00% |
| Authorization | 64 | 64 | 5 | 100.00% |

这里的 100% 是对应确定性检查的通过率，不应在简历或面试中缩写成“AI 准确率 100%”。Token、TTFT 和成本对该离线 harness 不适用。

## 2. 真实模型固定场景

首批原始报告：[2026-09-20 full run](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-20T11-56-29.498Z.md)

- 首批 10/10 场景完成，8/10 scenario pass，generation success 8/10。
- P50 `7807 ms`，P95 `20264 ms`，使用 nearest-rank 口径。
- `live-05-empty` 与 `live-09-tool-error` 失败；首批报告原样保留。
- 工具使用合成库存/政策 fixture；telemetry 和受控 harness feedback 写入经批准的开发库；没有写业务订单。

后续证据：

- [两场重试仍失败](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-21T06-57-22.732Z.md)
- [`live-05-empty` 单场通过](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-21T07-04-35.113Z.md)
- [`live-09-tool-error` 单场通过](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-21T07-06-17.929Z.md)

因此可验证的总结是：**10 个不同固定场景分批取得通过**。最后一个 tool-error recovery 场景按场景规则通过，但 run 状态正确保留为 failed；这证明报告没有把工具错误从 telemetry 中抹掉。

## 3. 延迟、Token 与成本

- 可引用的延迟只来自首批 10 场景：P50 7.807 秒、P95 20.264 秒。
- 非流式生成没有 TTFT；不能从总耗时推导首 token 延迟。
- 报告保存了已知 input/output token；中断或多步部分 usage 按 unknown/null 传播，避免把不完整值当总量。
- 没有带来源 URL 和日期的经核验模型价格文件，所有 live cost 为 `unknown`。单次成本 **未测**，不能写 0，也不能从其他模型价格猜测。

## 4. UI、拒绝与 Tracing 证据

版本化截图均由 Playwright HTTP fixture 生成，UUID 和反馈 receipt 是合成值：

- Staff：[success](../../output/playwright/feature05-success.png) · [empty](../../output/playwright/feature05-empty.png) · [timeout](../../output/playwright/feature05-timeout.png) · [denied](../../output/playwright/feature05-denied.png)
- Guest：[success](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/output/playwright/feature05-success.png) · [empty](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/output/playwright/feature05-empty.png) · [timeout](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/output/playwright/feature05-timeout.png) · [denied](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/output/playwright/feature05-denied.png)

生成来源、状态语义与当前 SHA-256 汇总在 [Fixture Screenshot Manifest](assets/screenshots/README.md)。

真实数据库/HTTP 证据摘要位于 [Feature05 Closeout](../design/2026-09-17-evaluation-observability/CLOSEOUT.md)。Trace 只存白名单字段；浏览器截图中的 synthetic trace 不能用 `ai:observe` 查询。

## 5. 失败样本与改进说明

| 失败 | 观察 | 保留的改进方式 |
| --- | --- | --- |
| Empty inventory live 场景失败 | Provider generation error，不是业务库存写入错误 | 保留首批失败；独立单场补验并保留新 trace |
| Tool-error recovery live 场景失败 | 工具错误/生成错误需要同时在场景与 run 生命周期中表达 | 场景后来通过，但 run 仍为 failed，防止假成功 |
| 未配置价格 | Token 有时可见，但价格来源不可验证 | 成本保持 unknown，要求显式 `AI_PRICE_FILE` 来源与日期 |
| AI/网络超时 | UI 不能把 AI 当作业务单点 | Guest 保留常规筛选/预订入口；Staff 保留订单操作与人工处理 |

## 6. 可追溯简历数字

允许使用的数字：

- `69` 条固定离线用例。
- 工具选择 `45/45`、硬约束 `69/69`、引用 `24/24`、授权 `64/64`，必须限定为离线 contract/synthetic checks。
- 真实模型首批 `8/10`，P50 `7.807 s`、P95 `20.264 s`；10 场景是“分批取得通过”。
- 两端 fixture 浏览器各 `5/5`。
- 开发数据库并发限流 `2 allowed / 3 denied / 0 residue`。

禁止使用：虚构的用户增长、转化率、营收、生产 uptime、“一次 10/10”、模型准确率 100%、成本 0。

对应可直接使用的受限表述见 [Resume Bullets](RESUME_BULLETS.md)。
