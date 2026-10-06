# Wild Oasis 双项目 GPT-6 迁移计划

制定日期：2026-10-04；实施更新：2026-10-06（Asia/Shanghai）。状态：用户已同意三个生成工作流与embedding一起迁至OpenAI；本地代码/离线检查与数据库回滚验证已完成，真实调用、向量校准/激活及生产切换待密钥与预算。原混合模型计划保留为历史设计。

范围为 `17-the-wild-oasis-ai`（Staff）和 `21-the-wild-oasis-website-ai`（Guest/BFF）。模型接入统一在 Guest/BFF 实施；Staff 负责跨端契约与实际使用验收。阶段用时为单人有效工作时间估计，不包含账户准备、付费评测授权和人工验收等待。

## 2026-10-06 补充：三个生成工作流全部使用 Luna

### 当前实施与剩余步骤

- 接入已实现：OpenAI Responses、Luna/low/Standard/store:false；Concierge与Copilot总输出预算6144、Briefing4096（包含推理预算），维持既有硬超时。Operations有独立配置与一致的预检/遥测，Briefing缓存区分effort。
- embedding已实现为`text-embedding-3-small` / 768，替换Google查询与文档生成；同维模型转换仍强制重新生成。SQL按模型/指令身份筛选、保持public/staff RLS，并整批原子入库。
- 当前证据：Guest 46files/720tests、lint/typecheck/build PASS；新SQL在实际生产项目的rollback-only事务验证通过且没有持久变更。尚无Luna真实质量或OpenAI语义检索校准证据。
- 密钥仅放Guest/BFF Vercel Production/Preview与本地ignored`.env.development.local`；Vercel Sensitive密钥不能导出，故本地需另配置同一OpenAI项目密钥。Staff浏览器无需模型密钥。真实验证与重建总预算待用户回复。
- 已准备7政策文档/16块；实际生产项目`fadfglcobmxxsawxlmpb`当前政策表为空。`npm run policies:prepare-openai -- --dry-run`无远端调用；`--prepare --max-usd <预算>`只生成ignored artifact并记录usage/hash、零数据库写入。真实查询向量需校准现有0.55/0.04阈值后再激活。
- 后续顺序：核对账户/网络→有预算的Luna关键样本与embedding准备/校准→持久SQL迁移→针对已核对生产项目执行原子全语料入库→真实RLS/检索与Preview跨端验收→生产切换和回退核对。禁止混用本地旧开发库作为生产目标。

用户因 Gemini 免费每日额度频繁耗尽，询问是否可将两个项目统一迁移到 `gpt-6-luna`，不使用 Sol。**技术上可行，建议作为成本优先的迁移目标；质量结论仍需项目样本验证。** 以下为原计划的单模型变体，原 Sol/Luna 对照方案保留为历史设计依据。

| 工作流 | 单模型方案 | 首轮验证重点 |
| --- | --- | --- |
| Guest Concierge | `gpt-6-luna`，显式 `low` | 中文多轮、偏好回顾不重复查房、政策引用、卡片后完整说明、取消和限流恢复 |
| Staff Operations Copilot | `gpt-6-luna`，显式 `low` | 多工具协同、受控中文备注、审批卡、Reject/Approve、草稿成功后停止；必要时只比较同一 Luna 的 `medium` |
| Staff 风险 Briefing | `gpt-6-luna`，显式 `low` | 固定 JSON/Zod、过敏等高风险漏报、severity/actionItems、25 秒截止 |

官方 Luna 页面确认支持 Streaming、Function calling、Structured outputs；支持 `none` / `low` / `medium` 等 effort，默认 `medium`。本方案使用 Responses 承载带推理的工具调用，起步显式设置 `low`。这是接口能力依据，不等于本项目质量已通过。[Luna 模型](https://developers.openai.com/api/docs/models/gpt-6-luna)、[GPT-6 迁移参数](https://developers.openai.com/api/docs/guides/latest-model)。

原计划 M0–M4 继续适用，改动为：M1 的三项生成模型均设为 Luna；M3 从 Sol/Luna 横向比较改为 Luna 对既有业务基线及必要的 effort 对照；关键验收门槛保持不变。不设置自动 Sol 升级/付费回退。未达标场景先调整有界提示、工具门控或 Luna effort，仍未达标则不发布该场景。当前 provider 仅支持 Google/Gateway，仍需原计划的 OpenAI adapter 与参数/工具契约适配，不能只替换 Gemini 模型字符串。

拟实施配置（当前代码尚不支持这些 OpenAI 配置）：

```dotenv
AI_PROVIDER=openai
AI_CONCIERGE_MODEL=gpt-6-luna
AI_CONCIERGE_REASONING_EFFORT=low
AI_OPERATIONS_MODEL=gpt-6-luna
AI_OPERATIONS_REASONING_EFFORT=low
AI_BOOKING_INSIGHT_MODEL=gpt-6-luna
AI_BOOKING_INSIGHT_REASONING_EFFORT=low
# OPENAI_API_KEY 仅配置在 Guest/BFF 服务端。
```

“全部使用 Luna”指三个生成工作流。政策向量化仍为 `gemini-embedding-2` / 768 维；沿用现有文档与查询 embedding 时无需重新生成向量库，但 Google embedding 仍有独立依赖与配额。若目标是完全移除 Google，则另选 embedding 模型并将文档/查询同步迁移、重新向量化和校准检索；Luna 不作为 embedding 模型替代品。[Embedding 文档](https://developers.openai.com/api/docs/guides/embeddings)。

用户进一步询问 Google 限额是否仍影响检索：生成模型额度耗尽不等于 embedding 额度必然耗尽，Google 限额随模型变化、应用于项目，实际以 AI Studio 配额为准。[Google 限额](https://ai.google.dev/gemini-api/docs/rate-limits)。但本项目每次政策查询先执行 `embedPolicyQuery`、再执行数据库混合检索；Google embedding 失败时不会进入数据库检索，也没有不依赖 embedding 的关键词备用路径。当前 catch 返回 `insufficient-evidence`，健康的生成模型可说明无法确认政策；库存/报价等数据库工具和偏好回顾不需要 Google embedding。若目标是让所有 Google 额度问题都不能阻断政策检索，建议把独立 embedding provider 迁移与检索失败分类/降级纳入后续方案；此扩展需要重建文档向量，不能承诺只切生成即可移除全部 Google 依赖。尚未实施。

2026-10-06 核对 Standard 短上下文：Luna 每百万 tokens 普通输入 $0.10、输出 $0.50，对应 Sol 的普通输入/输出单位价格的 1/20。假设一次任务的所有模型步骤合计 10,000 普通输入 tokens 与 2,000 计费输出 tokens，则生成费用约 $0.002，1,000 次同条件任务约 $2；这是算术示例，不是项目实测或费用上限，未包含 embedding、重试额外用量、数据库和部署费用。[官方价格](https://developers.openai.com/api/docs/pricing)。

Luna API 的 Free 层不支持；必须核对 API 计费、模型权限和实际账户限额。迁移后生成不再消耗 Gemini 免费生成日额度，但 OpenAI 仍有账户/项目请求、token 和支出限制，不能承诺无限使用。[Luna 限额](https://developers.openai.com/api/docs/models/gpt-6-luna)、[限额规则](https://developers.openai.com/api/docs/guides/rate-limits)。

本轮仅更新方案与共享进度；未安装 adapter、修改运行时默认模型、读取/配置密钥、开通计费、调用付费模型或改变生产部署。

## 原方案：建议模型与选择依据（2026-10-04）

**主模型候选为 `gpt-6.1-sol`；风险 Briefing 优先评测 `gpt-6-luna`。** 若必须只配置一种生成模型，先评测 Sol。最终按各工作流的成功率、响应速度和每个成功任务成本决定，当前结论属于根据源码任务复杂度作出的建议。

| 工作流 | 首轮候选与显式 effort | 对照方案 | 项目依据 |
| --- | --- | --- | --- |
| 顾客 Concierge | Sol / `low` | Luna / `low`，必要时比较 `none` | 中英文、多轮澄清、房态工具与政策证据需要协同；同时对流式首字延迟敏感 |
| 员工 Operations Copilot | Sol / `low` | Luna / `low`；困难只读问题可小样本比较 Sol / `medium` | 当前已显式 `reasoning: "low"`；涉及多个经营工具、中文语法、证据解释与审批卡 |
| 订单风险 Briefing | Luna / `low` | Luna / `none` 和 Sol / `low` | 单条脱敏观察转为固定 JSON；仍需重点测食物过敏等高风险场景是否漏报 |
| Astra | 仅作为困难失败样本的质量对照 | 不进入首轮默认路由 | 当前主要任务是有界业务工具编排，是否需要最高能力尚无实测证据 |

OpenAI 官方将 Sol 定位为兼顾能力与成本，将 Luna 定位为高吞吐的集中任务；两者支持流式响应和 Structured Outputs。Sol 的默认 effort 为 `medium`，应显式设置项目需要的 `low`。[模型目录](https://developers.openai.com/api/docs/models)、[Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol)、[Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)。

截至制定日期，Standard 短上下文的公开价格如下，单位为美元 / 百万 tokens。表中输入价格不代表整次任务成本，区域、长上下文和其他处理层价格需另行核对。[官方价格](https://developers.openai.com/api/docs/pricing)。

| 模型 | 普通输入 | 缓存读取 | 缓存写入 | 输出 |
| --- | ---: | ---: | ---: | ---: |
| `gpt-6.1-sol` | 2.00 | 0.10 | 2.50 | 10.00 |
| `gpt-6-luna` | 0.10 | 0.01 | 0.125 | 0.50 |
| `gpt-6-astra` | 10.00 | 1.00 | 12.50 | 50.00 |

Sol 的普通输入/输出单价是 Astra 的五分之一；总费用仍取决于实际 token、重试和工具循环。旧项目成本为 unknown，不能据此宣称迁移后比 Gemini 更便宜。

## 源码基线与迁移影响

| 位置 | 当前事实 | 需要规划的改动 |
| --- | --- | --- |
| Guest `package.json` | `ai@7.0.58`、`@ai-sdk/google@4.0.42`，没有 OpenAI provider | 增加与现有 AI SDK V4 模型契约兼容的 `@ai-sdk/openai`，核验后固定版本 |
| Guest `app/_ai/providers/concierge-model.ts` | 只接受 `google` / `gateway`；默认 Gemini `3.8-flash`；Gateway 默认 GPT-5.6 Terra | 增加直连 OpenAI 分支，显式选择 Responses；保留可配置的回退路径 |
| Guest `app/_ai/providers/booking-insight-model.ts` | 共享 provider 设置，模型可单独覆盖 | Briefing 独立模型与 effort；与实际调用身份保持一致 |
| Guest `app/_ai/agents/operations-agent.ts` | 复用 Concierge resolver，最多 8 steps，已设 low | 新增 Operations 独立配置；保留工具门控及备注成功后停止规则 |
| Guest `app/_ai/agents/concierge-agent.ts` | 最多 8 steps；输出上限 900 tokens；effort 未显式设置 | 设置明确 effort，检查推理与输出预算、工具后续步骤和多轮历史 |
| Guest `app/_ai/booking-insight-generator.ts` | `generateText` + `Output.object` + Zod；25 秒超时 | 检查 JSON Schema、拒绝/截断处理与明确输出预算 |
| Guest `app/_ai/observability/run.ts` | 只汇总 input/output tokens | 增加安全的推理与缓存用量，以及实际调用模型/effort/处理层身份 |
| Guest `tests/live/feature05.live.test.ts` | 10 个 Concierge 场景；真实模型、合成业务工具、开发库遥测 | 扩充 Copilot/Briefing；修正只有 input/output 单价的成本公式 |
| Guest `app/_ai/providers/policy-embedding-model.ts`、`policy-rag.config.json` | `gemini-embedding-2`，768 维 | 本次生成模型迁移保留此检索依赖与 Google embedding 凭据 |
| Staff 前端 | 通过 BFF 使用 Briefing、Copilot 与审批 | 用现有组件验证卡片、取消、错误恢复、Approve/Reject 和窄屏布局 |

2026-10-06 补充基线：Guest 已发布 `374a132`，Concierge 输出上限已从制定时的 900 调为 2400，并新增 length 提示、偏好回顾工具门控和 Gemini 每日配额保护；Operations 仍为 1200。迁移验证应覆盖这些新行为，并重新核对推理与可见输出共用预算，不能直接采用上表旧额度。当前离线完整检查为 44 files / 705 tests、HTTP fixture 浏览器 7/7；这些不是 Luna 实测证据。

2026-10-04 静态核查：Staff HEAD `3291c09`，存在既有 `.gitignore` 修改；Guest HEAD `0bc8484`，工作区干净。文档中的 Gemini `3.6-flash` 与源码默认 `3.8-flash` 不一致，实施前必须记录每个部署环境实际配置。历史报告保留原模型，不批量替换旧模型字符串。

## 必须先解决的兼容性

1. **Provider 与端点。** 当前 Google 分支会拒绝 GPT 模型名。优先增加直连 OpenAI 的 Responses adapter，以减少 Gateway 可用性及参数转发的变量；实现时检查包源码/类型并捕获脱敏请求断言实际访问 `/v1/responses`。Sol/Astra 的工具调用要求 Responses，不能以 Chat Completions 承载。[GPT-6 迁移说明](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)。
2. **参数与输出预算。** 固定 effort；Sol 不接受 `none` / `minimal`。非 `none` 请求去掉 `temperature`、`top_p` 和 logprobs 类参数。Operations 当前上限 1200、Concierge 900，迁移后需检查 adapter 是否映射到 `max_output_tokens`；该上限包含推理与可见输出，可能尚未输出正文就耗尽。先在有限预算的小样本中检查 incomplete/length，再按实测分工作流确定额度；用简洁输出设置约束正文。[推理文档](https://developers.openai.com/api/docs/guides/reasoning)。
3. **工具与结构化输出。** 检查 strict schema 的 required、nullable 和 `additionalProperties`，尤其是现有可选参数。需要转换时仅在模型接口层转换，再以现有业务 Zod 校验恢复契约。Briefing 的标签、长度、severity 与 actionItems 限制继续有效；拒绝、空输出和 JSON 截断不能写成成功。[Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)。
4. **状态与隐私。** 保留当前服务端验证和重建消息的方式；验证 adapter 在同一工具循环内传回正确的调用结果及所需 reasoning items。建议请求显式 `store: false`，核验 adapter 支持；这一设置不能被描述为账户已启用 Zero Data Retention。浏览器上传的历史工具结果仍是非可信输入。[Responses 迁移与状态](https://developers.openai.com/api/docs/guides/migrate-to-responses)。
5. **Briefing 缓存身份。** 当前 source hash 已含 model、promptVersion、observation；切换模型会自然变 stale。新增 effort 等影响生成行为的配置应纳入生成配置版本或 identity。不得批量重新生成全部订单；按现有显式 Generate/Reanalyze 路径验证，并保留员工反馈。
6. **遥测与计费。** 模型选择、route 配置检查和 observer 必须使用同一解析结果，避免 Copilot 使用新模型却记成 Concierge 模型。当前 SDK 类型已有 cacheRead/cacheWrite/reasoning 明细，需要 adapter 实测确认。缓存写入价格替代对应输入价格，并非额外叠加；reasoning 属于 output 账单子集，不重复计费。[Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)。

## 分阶段执行

### M0：冻结基线与准备（约半天）

- 记录两个仓库 HEAD、dirty 文件、各环境 provider/model/effort 和现有部署标识；避开现有未提交修改。
- 确认 OpenAI 项目账户对候选模型的权限、额度与服务器网络；密钥仅放 Guest/BFF 服务端，Staff 无需模型密钥。
- 固定评测样本、业务工具 fixture、prompt 版本和参考日期。使用历史报告作为历史对照；需要公平新对照时仅在有预算授权后重新测当前 Gemini。
- 将迁移过程记录在既有 `FEATURE06_PROGRESS.md`，不将迁移规划扩展为 Feature06 已完成。

完成条件：能够复现当前离线基线，配置与回退清单明确；账户权限尚未验证时如实标记。

### M1：接入 OpenAI 与按工作流配置（约 1 天）

- 增加兼容的 OpenAI provider，复用 `createProxyAwareFetch`；通过注入 fetch/provider 的测试验证密钥缺失、模型非法、代理和请求取消行为。
- 新建 Operations resolver，并为 Concierge / Operations / Briefing 分别设置模型与 effort，默认值按前述评测候选准备。
- 不通过宽松字符串替换绕过 provider 校验；保留现有 Google/Gateway 分支作为显式回退选择。
- 调整 `/api/ai/admin` 的预检和 `observedRoute`，让配置错误、执行模型和遥测身份一致。
- 保持既有 UI message 协议；无需把两端 React 聊天界面改写为原始 Responses SSE 消费者。

建议配置形状如下，**这是待实现配置，不是当前即可生效的命令**：

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=<server-only>
AI_CONCIERGE_MODEL=gpt-6.1-sol
AI_CONCIERGE_REASONING_EFFORT=low
AI_OPERATIONS_MODEL=gpt-6.1-sol
AI_OPERATIONS_REASONING_EFFORT=low
AI_BOOKING_INSIGHT_MODEL=gpt-6-luna
AI_BOOKING_INSIGHT_REASONING_EFFORT=low
# Google embedding 仍使用现有服务端 Google 凭据。
```

完成条件：离线 adapter 测试确认 Responses 请求、参数和 UI/JSON 输出契约正确；不使用真实 API 密钥作为单元测试前提。

### M2：工具、Briefing 与两端契约（约 1 天）

- 保留 8-step 上限、政策查询一次约束、受控中文解析、固定工具与服务器计算价格/库存/经营指标的规则。
- 对流式 tool call 增量、多工具结果、JSON generate 模式和取消/超时分别验证；Operations 流式与非流式均需覆盖。
- 备注成功产生 trusted approval card 后立即停止 provider 循环。失败工具不能误判成功；不重跑整个 agent 以重试模型，不向第二 provider 重放已有副作用。
- Briefing 保留 25 秒截止；校验模型输出、拒绝/截断和 stale/reanalysis；高风险标签需有人审阅结果。
- 先保持 prompt 语义一致，新增必要参数与端点适配；模型对照后再单独调 prompt 或 effort，避免同时改变多个变量。
- 核验 stream 90 秒 total、60 秒 step，generate 90 秒 total、80 秒 step 和 100 秒 route 上限；调整须有实测依据，不靠无限延长超时获取通过。

完成条件：工具只读与审批契约无回归，UI 可以恢复失败请求，标准订房/经营页面继续可用。

### M3：补齐用量与对照评测（约 1–1.5 天，需评测预算）

- 给 observer 增加 nullable 用量明细；若需要持久化，使用追加式遥测迁移，不改订单与审批表的业务规则。旧报告仍使用原 schema，新增报告写入 schemaVersion。
- 核对 SDK 和原始 Responses usage 是否一致；以三个互斥输入桶计算价格：普通输入、缓存读取、缓存写入，再加总输出。已有总输出包含 reasoning 时不可再加一次 reasoning。调用失败/用量不全且无法核实账单时保持 unknown。
- 记录实际 model、effort、处理层、prompt 版本、样本集、各 step、延迟、TTFT、重试与成本；遥测继续不保存原始聊天、备注或个人信息。已失败尝试可能发生费用，不能仅计算成功输出。
- 先运行每种候选 3–5 个代表性 smoke，再运行固定正式样本；至少包含 Concierge 既有 10 例、Copilot 经营/政策/中文备注/拒绝/批准等不少于 12 例，以及 Briefing 不少于 20 例。模型质量样本建议各重复 3 次，报告每轮与汇总；单场补跑不得覆盖首轮失败记录。
- 先比较同 prompt、同工具、匹配 effort 的 Sol/Luna，再按回归原因单独比较较低 effort 或 Sol medium。Astra 只用于少量困难失败例，获得预算后再做。
- 真实模型+合成工具、真实检索+开发库、fixture UI、生产 smoke、人工验收分开报告。现有 live runner只覆盖 Concierge，不能推导 Copilot 或 Briefing 已验证；现有非流式 runner 无 TTFT，需单独测真实流式首字。

建议门槛如下，属于本计划的验收提案；延迟/成本预算在 M0 固定后执行：

| 维度 | 上线门槛 |
| --- | --- |
| 权限、隐私、审批 | 固定对抗用例全部通过；未授权零业务写入，Reject 零订单变更，Approve 仅允许 internal note |
| 业务硬约束 | 价格、库存、容量、日期与 sourceIds 全部以工具事实为准；政策缺少证据时不补编答案 |
| 模型质量 | 首轮与重复轮分别报告；固定关键场景全部通过，其他场景总体成功率不低于同条件基线 |
| Briefing | JSON/Zod 合格；固定高风险样本无漏报；评审关注 severity/actionItems，confidence 不当作已校准概率 |
| 稳定性 | 取消、429/5xx、provider 与 tool 错误正确降级；成功备注后 provider 调用次数为 1；幂等规则通过 |
| 延迟 | 保持现有硬超时；建议 P95 不高于公平基线的 1.2 倍，并单独评估可接受 TTFT；小样本不视为生产 SLA |
| 成本 | 在事先约定的每成功任务预算内；缺失 usage、失败调用费用和 embedding 成本分别披露 |

完成条件：产出可追溯对照报告，并按工作流决定 Sol/Luna；没有实测结果时仍使用“候选”。

### M4：部署、验收与回退（约半天）

- 先部署 Preview/受控环境，沿真实用户路径走 Guest 房态推荐 → Adopt plan，Staff Briefing → feedback，Copilot 多工具经营查询 → 中文备注 Reject → 新 draft → Approve。
- 保持精确 Staff origin/CORS、JWT 角色校验及服务端受控写入；确认生产分支与隔离开发库环境没有混用。
- Preview 通过后发布 Guest/BFF；Staff 仅在确有前端变更时同步发布。作品集文档明确实际 provider 与 embedding 依赖；不把既有截图当作 GPT-6 生产证据。
- 上线观察 provider 失败率、超时、TTFT/P95、工具错误、审批卡与成本。这个低流量项目可使用一次受控部署和快速回退；如需要流量灰度，应先实现可信服务端开关，不能假设已有百分比路由。
- 回退时恢复记录好的 provider 与每个工作流模型配置并重新部署；禁用迁移新增的 Operations override 时，Google 路径应明确继承原 Concierge 配置。保留新遥测字段和报告，不删除旧 Briefing、反馈或审批记录。
- 任何权限/隐私/审批回归立即回退；模型/延迟/成本超出预定门槛也回退。provider 出错时继续正常业务降级；模型切换仅对新请求生效，避免重放已有审批副作用。

完成条件：两端实际路径通过，生产 smoke 与人工验证有独立证据，回退过程可执行，统一进度记录更新。

## 验证命令与交付物

在两个仓库分别执行 `npm run check`、`npm run docs:check`；按改动执行已有 `npm run test:e2e:security` 和相关界面测试。Guest/BFF 运行 `npm run eval:ai` 检查离线契约；该结果不代表 GPT-6 准确率。

真实付费评测未来通过 `npm run eval:ai:live -- --live` 明确进入；实施时先扩充 runner 和成本口径。当前 live config 仅允许固定开发项目且会写遥测/反馈，执行前需有模型预算与该环境操作授权。生产 smoke 只传入明确的真实生产 URL。

最终交付：兼容的 provider/config 与测试、两端配置文档、必要的追加式遥测迁移、按工作流的模型对照报告、生产验收证据、回退清单和共享进度更新。估计总有效工时约 **4–5 个工作日**。

本轮实际完成的是官方资料核查、源码静态审阅和计划编写；未安装依赖、调用模型、运行付费 Eval、修改数据库或生产部署。账户模型权限、实际生产配置和 GPT-6 实测效果均待实施阶段验证。
