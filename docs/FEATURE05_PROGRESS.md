# Feature05 开发进度与接续记录

> 本文件是 Feature05 的唯一进度记录。两个仓库共用，不再维护第二份状态副本。
> 新对话先读本文件，再核对两个仓库的实际 Git 状态；文档不能替代代码和验证证据。

## 当前接续点

- 最后更新：2026-09-21 19:48（Asia/Shanghai，人工验收通过）。
- 当前阶段：Feature05「评测、可观测与安全加固」。
- 当前状态：用户已明确“我已验收通过”，人工四场景验收完成。开发、规范复审和自动验证均已通过，进入最终代码质量审查；审查结束前不标正式关闭。
- 上一阶段：Feature04 已于 2026-09-16 正式关闭，用户本轮再次确认完成，无需重复等待 Feature04 验收。
- 当前执行项：F05-07 规范审查、可复现人工验收材料及收尾。
- 下一步：完成质量审查；若有缺陷复用 feature05_implementer 修复并针对性验证，通过后完成文档收尾和阶段关闭。无需再次请求人工验收或重复付费live，不自动提交/发布。
- 当前阻塞：无。
- 正在运行的进程/测试：固定代码质量审查代理 feature05_quality_reviewer 在运行；无测试或预览服务。
- 本轮范围：Feature05 技术设计、实现与验证；保留此前未提交的进度文件与 AGENTS.md。

## 项目与依据

| 项目 | 实际位置 | 职责 |
| --- | --- | --- |
| 运营后台 | `D:/working/code/17-the-wild-oasis-ai` | React/Vite 员工端、总技术方案、本进度文件 |
| 顾客网站 | `D:/working/code/21-the-wild-oasis-website-ai` | Next.js 网站、AI BFF、Agent、共享数据库迁移、主要 Eval |

旧技术方案示例路径没有 `-ai` 后缀；实际开发必须使用上表两个仓库，不修改课程原版目录。

必读依据（相对本文件）：

1. [总技术方案](design/2026-08-03-ai-hospitality-platform/TECHNICAL_SPEC.md)。顶部仍是 Feature03 的历史对齐状态，不能据此判断 Feature04 未完成。
2. [Feature05 原始任务](design/2026-08-03-ai-hospitality-platform/feature/05-evaluation-observability.md)。
3. [Feature04 最终收尾](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/policy-rag-closeout.md)。
4. [Feature04 原始 live 证据](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/policy-rag-live-evidence.json)。

初始 Git 快照（2026-09-17；仅供定位，接续时重新查询）：

| 仓库 | 分支 | 初始 HEAD | 创建本文件前状态 |
| --- | --- | --- | --- |
| 后台 | `codex/ai-hospitality-platform` | `b934a20a14407614f1edcf915556e6e0f87f5b6d` | `git status --short` 无变更 |
| 网站 | `codex/ai-hospitality-platform` | `b37a5ca64a967d058ab562e78763266d7444bbda` | `git status --short` 无变更 |

## 实时更新约定

- 开始一个任务前，先更新「当前接续点」和任务表中的进行中项。
- 每完成一个可独立说明的改动、测试批次、设计决策，或遇到阻塞时，立即同步；不等整阶段结束才写。
- 每次同步至少写清：任务 ID、实际修改文件、验证命令及结果、未解决事项、下一步。
- 测试失败、部分通过、未执行、因环境无法运行必须明确区分；重跑成功也保留重要失败原因。
- 准备结束对话、切换任务或接近上下文上限时，先保存接续点，包括未提交修改、运行中进程及恢复命令。
- 状态使用：待开始 / 进行中 / 已完成 / 阻塞。只有验收证据齐全才标记已完成。
- 不写密钥、Token、完整邮箱、证件号、未经脱敏的客户输入或完整模型请求；记录配置项名和安全的证据路径即可。
- 当前状态与下一步保持简短；历史变更按时间追加，历史证据不覆盖成新的通过结论。

## 任务拆分与验收

以下是对原四项实施任务的执行拆分，不改变需求范围。具体文件和技术选择在 F05-01 核对后补充。

| ID | 任务 | 状态 | 完成条件 / 证据 |
| --- | --- | --- | --- |
| F05-00 | 阶段定位、基线盘点、跨对话记录入口 | 已完成 | 本文件、两个 AGENTS.md；已核对 Feature04 收尾和两仓库初始状态 |
| F05-01 | 细化实施方案与验收矩阵 | 已完成 | 明确测试层次、覆盖范围、数据契约、追踪生命周期、反馈权限、限流和超时策略、报告口径 |
| F05-02 | 分层确定性测试与统一 Eval 数据集 | 已完成 | 69固定用例，独立stay/库存oracle；18测试含12新增生产执行反例通过，规范复审PASS |
| F05-03 | Eval runner 与可保存报告 | 已完成 | 最新offline JSON/MD时间2026-09-21T11:43:26.648Z；分母/跳过/null/失败透明，旧报告与失败归档 |
| F05-04 | 最小可观测链路与反馈 | 已完成 | 三入口白名单观测、签名反馈、RLS/SQL证据、真实live遥测反馈落库及诊断CLI，生命周期/部分usage边界通过 |
| F05-05 | 安全、限流、超时与非 AI 降级 | 已完成 | 实际并发HTTP 2允许3拒绝/0残留，真实拒绝HTTP及denied trace；权限/审批测试和双端降级UI通过 |
| F05-06 | 双端关键路径 E2E 和固定场景测量 | 已完成 | 双端5+5浏览器测试及8截图；10不同live场景分批通过，首批8/10和后续失败全部保留，未知成本不按0计 |
| F05-07 | 完整检查、人工验收与阶段收尾 | 进行中 | 两端check、规范复审、用户人工验收已通过；最终质量审查及收尾进行中 |

## 已盘点能力与缺口

截至 2026-09-17，本节依据文件检查，未重新运行上一阶段测试。

- 网站已有 `tests/ai/concierge-cases.json`（32 条）及 `concierge.eval.ts`，使用 `MockLanguageModelV4`；由 `concierge-eval.test.ts` 纳入测试。
- 网站已有 `tests/ai/policy-rag-cases.json`（24 条），`policy-retrieval-eval.test.ts` 使用合成向量验证本地检索。合计 56 条旧用例不代表已满足统一 Eval 的覆盖和报告要求，更不是 56 条真实模型评测。
- 网站已有工具、路由安全、隐私、审批、政策引用及 UI 测试；后台已有 8 个测试文件，包括 `OperationsCopilot.test.tsx`、`apiOperationsCopilot.test.ts`、`BookingInsightCard.test.tsx`。
- 网站已存在超时处理：Concierge route、Admin route、booking insight generator；应在现有行为上核对缺口。
- `package.json` 两端均有 `test` 和 `check`，均尚无 `eval:ai`、`test:e2e`。初步文件检索未发现 Playwright/E2E 配置。
- 初步搜索共享迁移未发现 `ai_runs` / `ai_feedback`，还需设计并实现统一追踪；已有 booking insight feedback 不能直接等同于本阶段通用反馈完成。
- 模型配置保持已有项目设置；新 SDK 用法按安装版本及官方资料核实，不能直接套用其他版本的 callback 示例。

优先阅读位置（网站仓库内相对路径）：

- `app/_ai/agents/concierge-agent.ts`、`operations-agent.ts`。
- `app/api/ai/concierge/route.ts`、`app/api/ai/admin/route.ts`。
- `app/_ai/booking-insight-generator.ts`、`booking-insight-service.ts`。
- `app/_ai/operations-auth.ts`、`operations-approval.ts`、`operations-tools.ts`。
- `tests/ai/concierge.eval.ts`、`policy-retrieval-eval.test.ts`、`operations-route-security.test.ts`、`operations-approval.test.ts`。

## 决策与指标约束

- 优先复用已有测试与安全机制，补齐统一数据集、报告和观测缺口；不重复重建 Feature01–04。
- 离线 Mock、合成检索、真实模型、真实数据库、浏览器 E2E 必须分别标注；禁止将模拟正确率包装成真实模型准确率。
- 缺失 Token/价格/TTFT 等值标记未知或不适用，不按 0 伪造；成本价格来源和适用日期需要记录。
- 保留固定种子/时间、模型及 prompt 版本、执行命令、场景 ID 和失败样本，使报告可复现。
- Feature04 live 曾有 429 和证据不足，最终 12 项不同检查分批通过；不能改写为一次运行全部成功。
- 当前尚未确定的实现细节：观测覆盖哪些入口及非模型请求、匿名反馈与员工反馈权限、日志保留时间、限流存储方案、成本计价方式、live 场景预算。先按现有架构形成具体方案；仅在确需业务取舍时询问用户。

## 验证记录

| 日期 | 范围 / 命令 | 结果 | 证据 / 限制 |
| --- | --- | --- | --- |
| 2026-09-17 | 两仓库 `git status --short`、分支和 HEAD 查询 | 创建进度文档前均无变更，分支和 SHA 见上表 | Git 提示无法访问全局 ignore；命令仍完成 |
| 2026-09-17 | 读取 Feature05 规格、Feature04 closeout、两端脚本及测试入口 | 完成初步盘点 | 仅静态检查，本轮没有运行功能测试 |
| 2026-09-17 | 创建后核对 Git 状态及 Markdown 本地链接 | 后台仅新增 AGENTS.md 和本文件；网站仅新增 AGENTS.md；链接目标均存在 | 三个文件尚未提交；纯文档改动未运行功能测试 |
| 2026-09-17 16:31 | 网站 npm run test（恢复开发基线） | 33 文件 / 441 测试通过，exit 0 | 本轮实际执行；不含 live/构建 |
| 2026-09-17 16:31 | 后台 npm run test（恢复开发基线） | 8 文件 / 70 测试通过，exit 0 | 既有 React Router future warnings；本轮实际执行 |
| 历史：2026-09-15 至 16 | 两端 `npm run check` 与 Feature04 live 验证 | 网站 33 文件 / 441 测试；后台 8 文件 / 70 测试；12 项 live 分批通过 | 引用 Feature04 closeout，非本轮重跑，也非 Feature05 验证 |

## 变更日志

### 2026-09-21 — 用户要求继续

- 重新核对两仓库实际文件与 Git，保留此前未提交修改及全部报告；未把上次代理计划写成完成。
- 已确认 live 的定向场景参数、安全错误诊断和 provider 中途失败总用量修复尚未落地，已恢复同一实现代理继续。
- 后续顺序：完成补丁 → 两失败定向 live → 最终检查及规范审查 → 提供八张双端截图和真实 trace 供人工验收；不重跑已通过的付费场景。
- 已整理 [人工验收材料](design/2026-09-17-evaluation-observability/MANUAL_ACCEPTANCE.md)，8 张截图及进度文档的相对链接均实测存在。`npm run ai:observe -- trace 7d79b494-c942-4fa1-9bd9-3f04fb8c1089` 本轮 exit 0，可读取 completed 状态、Token、prompt/model 版本及 helpful 测试反馈，输出无原始对话。
- 已落地 `--case` 定向 live、安全异常类型/状态码/因果链、provider 失败用量 null、环境示例去重。实现代理实跑 typecheck exit 0、observer14+live断言4共18通过、两端 diff --check通过；另继续修复显式失败被工具错误覆盖的优先级边界。
- `npm run eval:ai:live -- --live --case live-05-empty --case live-09-tool-error` 本轮 exit 1，2/2 在生成重试阶段失败，遥测和反馈2/2保存。新报告 `tests/ai/reports/live/2026-09-21T06-57-22.732Z.{json,md}`：AI_RetryError → AI_APICallError → UnknownError，未取得HTTP状态；不将其误报为业务断言错误或429。
- 独立无凭据请求通过同一现有代理访问模型API根路径返回404，证明检查时可连通；正在补白名单网络cause code区分瞬态连接失败。历史失败保持原样，不自动放宽模型或断言。
- 实现代理自审完成：observer16、live断言/诊断5项通过；增加安全网络cause code、显式provider失败优先于隐式tool-error，pending取消保持优先；README定向命令/分母/失败语义补齐。已分派固定 `feature05_spec_reviewer` 进行完整功能点规范审查。
- 两端最终 `npm run check` 运行中（网站 session80076、后台91967）；网站单场 `live-05-empty` 网络诊断运行中（session46819），不重跑已通过八项。Controller 未启动新的浏览器服务器。
- 最终检查已结束：网站 `npm run check` exit 0，38 文件 / 495 测试、lint/typecheck、14 页构建通过；后台 exit 0，8 文件 / 70 测试及构建通过。日志分别为 `output/feature05-final-check-20260921.log` 和后台 `feature05-final-check-20260921.log`。
- `live-05-empty` 单场补验 exit 0，模型/断言未变，遥测/反馈保存成功；报告 `tests/ai/reports/live/2026-09-21T07-04-35.113Z.{json,md}`，trace=`00724b1c-5544-4197-85bb-afd687f62fd5`。此前无HTTP状态失败未取得具体cause code，不能宣称已确定根因。现在只运行最后的 `live-09-tool-error`（session7640）；已通过不同场景共9项。
- `live-09-tool-error` 单场补验 exit 0，报告 `tests/ai/reports/live/2026-09-21T07-06-17.929Z.{json,md}`，trace=`cb165a61-571c-4437-8b95-15f8d3805a8f`；场景故障恢复符合断言，运行仍正确保存 `failed/tool-error`、2 次工具错误、完整 4376/800 Token，遥测/反馈均成功。现已覆盖10个不同固定live场景的分批通过，绝非一次全套10/10。
- 后台默认lint仅js/jsx，额外对 `CopilotDrawer.tsx`、`ResponseFeedback.tsx`、`apiOperationsCopilot.ts`、`OperationsCopilot.test.tsx` 执行eslint，exit 0。所有Controller测试进程已结束。
- 规范初审暂不通过：唯一P2位于网站 `tests/ai/evals/runner.ts:98–104`，离线硬约束只检查输出自洽、非cabin-search直接true，可能漏掉错误kind、与请求不符的日期/人数/预算、双价格同时篡改和正常有库存却返回空列表。已恢复同一实现代理补独立expectedStay及库存oracle、分工具schema与反例；旧69条全绿报告仍是历史事实，但不足以证明这些负例。审查代理其余已检查项未发现必须修复问题，人工验收/历史网络失败另列。
- P2修复首轮：增加独立 `cabin-oracle.ts`、20条expectedStay（feature05文件19条+operations文件多轮1条）、保留toolName/toolCallId、12个真实Agent/工具执行后篡改结果/错参负例。旧offline JSON/MD完整归档至 `tests/ai/reports/history/2026-09-21-before-independent-oracle.*`。
- 新oracle首轮18测试17过1失败：真实捕获 `concierge-capacity-03` 的旧Mock解析将“sleeps two take four guests”误读为2人（独立expectedStay=4）。12个新增反例按预期拒绝；正在修Mock人数提取而非改expected/生产代码，并收窄两处SDK工具联合类型。此失败不标为全绿。
- 2026-09-21 19:41 用户要求接着修复：重新核对Git与补丁；独立oracle和负例文件在，latest offline仍为9月20日旧报告，不能宣称P2修复验证完成。已恢复同一实现代理，接着完成剩余解析/类型问题与18项验证，不重复已完成的live和E2E。
- 19:42 Controller 独立验证发现上次最终Mock regex与工具类型补丁已实际落地：`npx vitest run tests/ai/evals/feature05-eval.test.ts` 18/18通过（其中运行全部69固定用例与12个新增篡改/错参反例），`npm run typecheck` exit 0。正在执行显式 `npm run eval:ai` 更新归档后的latest报告，随后复审P2。
- 19:43 Controller `npm run eval:ai` 精确提升权限后 exit 0，18测试/69用例通过，新JSON/MD已写；实现代理另在19:42独立执行同命令成功，结果语义一致。P2代码自审结束并已恢复原 `feature05_spec_reviewer` 复审。此次只修改评测/fixture，不重跑已取得证据的付费live或UI E2E。
- 原规范审查代理复审 PASS：独立固定事实、工具名/调用ID关联、输出schema、20条独立预期及12反例均满足初审要求；未将expected传入Mock，未修改期望规避失败。仅读复审沿用Controller实跑结果，无剩余必须修复项。
- 已通过异步问题交付人工验收材料。技能明确顺序为“spec-review通过后，先人类验证，再quality-review”；尚未收到人工结果，因此不启动质量审查、不正式关闭Feature05。代码保持未提交；当前无测试/预览进程。
- 交付前复核：人工材料9个本地链接全部存在，Controller另查看双端成功截图；明确成功截图在反馈提交前，`Feedback saved.`由随后E2E断言验证，真实持久化另用trace查询证明，避免图片证据夸大。两端diff-check无错误。下一轮只需接用户人工结果，复用现有实现/审查代理，无须从头开发。
- 19:48 用户明确回复“我已验收通过”，据此记录四场景人工验收完成，不再等待或重复要求确认。已启动固定 `feature05_quality_reviewer` 进行代码质量审查；Controller核对收尾文档与证据。尚未提交、发布或开启Feature06。

### 2026-09-17 — F05-00 完成

- 确认 Feature04 已关闭，下一阶段为 Feature05。
- 新建后台 `docs/FEATURE05_PROGRESS.md`，记录当前快照、任务清单、历史证据边界和接续步骤。
- 新建两个仓库根目录的 `AGENTS.md`，要求后续开发读取并持续更新同一份进度记录。
- 本轮未实现 Feature05 功能。接续执行 F05-01，不将文档建立误记为评测/可观测功能完成。

## 新对话接续指令

### 2026-09-20 — 本轮恢复与首批验证

- 已重新读取两个 AGENTS、原始任务、细化方案及 Feature04 最终证据，核对双仓库 dirty 状态；本轮固定实现代理负责全部代码变更，Controller 负责记录及独立验证。
- 后台 `npm run check` exit 0：8 文件 / 70 测试、lint、typecheck、Vite 构建通过（1819 modules）；原有 React Router 提示保留。日志：后台 `feature05-check-20260920.log`。
- 网站 `npm run check` exit 0：37 文件 / 487 测试、lint、typecheck、构建及 14 页生成通过。既有图片 lint 提示及本机 webpack 缓存重命名 EPERM 警告不影响本次构建成功；日志：网站 `output/feature05-check-20260920.log`。
- 网站 `npm run eval:ai` 初次因沙箱 EPERM 无法覆盖既有报告失败；精确提升权限后 exit 0，6 runner 测试及 69 固定用例通过，已生成本轮 `tests/ai/reports/offline.{json,md}`；仍是离线契约证据。
- 真实 Supabase 只读确认三表 RLS 均开启，迁移版本仍为 `20260918020821`，并发探针残留 0。Security advisors 仍为既有两个审批函数 WARN、密码保护 WARN，以及 service-only 限流表无客户端 policy 的 INFO，无新增 WARN。
- `npm run ai:observe -- concurrency --live` 初次在受限网络失败；提升权限后并发 RPC 仍有失败，精确清理成功。独立只读 HTTP 查询 ai_runs 返回 200（当前 0 行）。正在补受控错误码诊断、等待全部并发结束再清理和失败报告，不将此记为并发验证通过。
- 已核对 Supabase 当前 changelog/RLS 文档，相关近期变动不要求改动本阶段三表；live 初稿正在加强独立约束断言、Markdown 和失败保存。
- 修复 `scripts/ai-observe.mjs`：等待全部并发请求结束后清理，增加有界 HTTP 超时、安全错误分类与失败报告；随后真实并发验证 exit 0：5/5 HTTP 200，limit=2 时 2 允许 / 3 拒绝，cleanupRemaining=0。证据：网站 `tests/ai/reports/database/concurrency-1789905042853.json`（generatedAt=2026-09-20T11:50:39.719Z）。前两次失败保留为历史，不推断未记录的根因。
- 两端 E2E 执行中：网站端口 3100，后台端口 5174；网站使用独立 `.next-e2e` 构建目录。观测重复取消/超时赋值已清理。
- 独立生产预览 3200 的真实 HTTP 负例通过：匿名 admin=401，跨源 concierge=403，无效 body=400，伪造 feedback=403；生成入口均返回一致 trace 且无反馈凭证，未调用模型。报告 `output/feature05-http-security-20260920.json`；本次受限进程未成功落库（独立 SQL 按三个 trace 查询为空），不能宣称完整遥测链通过。3200 进程已停止。
- 固定 live 已启动（10 个合成场景、现有模型、真实开发遥测，无业务订单写入）；增强后的 runner 包含独立日期/人数/预算/库存/故障回答断言、JSON/Markdown、active/unattempted 中断标记。结果待记；日志 `output/feature05-live-20260920.log`。
- 使用允许联网的独立生产预览重跑 HTTP 负例：4/4 拒绝路径通过；MCP 按本轮三条 trace 独立查得 `denied/unauthorized`（admin/跨源）和 `denied/invalid-request`（无效body）。网络开启报告：`output/feature05-http-security-network-20260920.json`。已停止 3200；上次沙箱落库失败未覆盖为通过。
- 第一批固定 live 已完整结束，exit 1：10 场景中 8 通过、`live-05-empty` 和 `live-09-tool-error` 生成失败；10/10 遥测与合成反馈均持久化。P50=7807ms / P95=20264ms，工具错误=2，价格未配置所以成本 unknown。完整原始报告：网站 `tests/ai/reports/live/2026-09-20T11-56-29.498Z.{json,md}`。这是实际模型+fixture业务工具+真实遥测，不是实时业务库存或用户满意度。正在补安全错误分类后定向诊断两失败，不重跑已通过八项或放宽断言。
- 后台 E2E 提升权限后 5/5 exit 0（17.7s，代理实跑），四场景截图在后台 `output/playwright/feature05-{success,empty,timeout,denied}.png`。网站首轮 2/5，因隐藏 route-announcer 与 alert 定位冲突、首次详情页编译等待不足而失败；已限定 dialog 并调整页面等待，重跑中，未改产品业务规避失败。
- 网站 E2E 重跑 5/5 exit 0（31.5s）；Controller 已读取两端 `test-results/e2e-results.json` 确认各 expected=5/unexpected=0，并查看双端超时截图。两端全部四场景截图已保存在各自 `output/playwright/`；属于 Mock HTTP 浏览器集成。
- 已发现并修复中的用量边界：provider 在后续步骤失败时，先前步骤累计值不应当作完整请求 Token 总量；需将该类总量标记 unknown 并补测试。首批 live-09 历史报告含部分累计值，仅作失败原始证据，不用于成本定价。

可直接将下面一段发给新对话：

> 继续开发 Wild Oasis AI 的 Feature05。先读取 `D:/working/code/17-the-wild-oasis-ai/AGENTS.md`、`D:/working/code/21-the-wild-oasis-website-ai/AGENTS.md` 和 `D:/working/code/17-the-wild-oasis-ai/docs/FEATURE05_PROGRESS.md`，再核对两个仓库的 Git 状态。从进度文档的「当前接续点」继续，每完成一个改动、验证批次或遇到阻塞就更新该文件。Feature04 已完成；保留已有未提交修改，不重复从零开发。


### 2026-09-17 16:15 — F05-01 完成，进入实现

- 已从技能模板生成并填充 [主设计](design/2026-09-17-evaluation-observability/TECHNICAL_SPEC.md) 与 [实施步骤](design/2026-09-17-evaluation-observability/feature/evaluation-observability.md)。
- 已核对 SDK 7.0.58 的 Agent callbacks 与 UI stream callbacks 差异；已有服务端客户端可写遥测，但不得代替业务 RLS client。
- 技术设计/开发技能要求一个固定实现代理；已分派完整 Feature05，Controller 负责进度、外部验证和后续审查。
- Supabase MCP 只读确认项目 tupdbxiujsfaifqulgmt 为 wild-oasis-dev，健康；本机未找到 Docker/psql。远端尚未执行新迁移。
- 设计采用白名单元数据、签名反馈凭证、持久原子限流、30天显式清理和未知成本null。用户已授权开始开发，常规技术选择直接推进。


### 2026-09-17 16:31 — 从中断恢复

- 用户要求继续；核对实现代理上次因 usage limit 异常结束。网站尚无 fixtures/evals/observability 文件，不能把已分派任务记为代码完成。
- 两仓库此前 AGENTS、进度及设计文档保留。已向同一实现代理发起恢复，从 F05-02/03 实际编码开始。
- 尚无 Feature05 测试结果或数据库迁移；没有运行中测试/服务器。




### 2026-09-17 16:34 — 恢复后的首批代码

- 网站 tests/ai/evals/report.ts 已创建（指标适用分母/跳过项、离线模式、Markdown输出）；仍在实现中，未宣称完成。
- 两端基线测试已通过：441 + 70；没有正在运行的基线进程。
- 下一步等待用例/执行器形成可运行批次，执行 eval 与针对性测试。


### 2026-09-17 16:37 — F05-02/03 可运行批次形成

- 网站新增 tests/ai/fixtures/{feature05,operations}.jsonl、tests/ai/evals/{concierge-fixture,rag-fixture,runner,report,feature05-eval.test}.ts、scripts/eval-ai.mjs，并修改 package.json 增加命令。
- 用例执行和报告验证尚在进行，尚未标记通过；仍保留旧基线结果作为对照。


### 2026-09-17 16:39 — F05-02/03 首轮实际执行

- 实现代理运行统一 Eval：69 条用例，3 项失败；故意错误工具oracle和null指标测试通过。
- 两条预算断言误解产品合约：生产工具允许返回明确标记 withinBudget=false 的备选，不应断言所有返回值都低于预算；正在修正为标签真实性检查，尚待重跑。
- rag-staff-waiver 为旧合成排名漏召回，保留失败证据并补生产 policy service 层检查，不改生产阈值或expected规避失败。
- 已要求补严格fixture schema、未知约束拒绝、逐项硬约束验证，以及真实user_metadata伪造角色负例。
- F05-04 迁移脚手架开始准备，远端尚未执行。


### 2026-09-17 16:41 — Eval 第一批通过

- 实现代理执行 eval:ai：69 用例通过，3 runner测试通过；报告已生成于网站 tests/ai/reports/offline.json / offline.md，Controller已读到实际报告。
- 指标：工具45/45、硬约束69/69、引用24/24、授权64/64；全部为离线契约/确定性adapter结果，不代表真实模型准确率或数据库RLS。
- RAG统一套件改为调用生产createPolicySearchService及确定性检索adapter，测试primary/supplement流程；原rank-only benchmark及其staff-waiver限制保持原样。
- 首轮latest报告在收到保留指令前已覆盖；代理将保存注明console摘录的历史记录，不伪装完整原始报告。
- schema/逐约束代码已加，负例测试与真正修改需求的多轮用例待补；F05-02/03尚未最终关闭。F05-04开始。


### 2026-09-17 16:46 — 观测模块与迁移初稿

- 新增网站 app/_ai/observability/run.ts、access.ts、app/api/ai/feedback/route.ts；尚在接入Agent/路由/UI。
- CLI 生成的最终版本化文件为网站仓库 `supabase/migrations/20260918020821_ai_observability.sql`，包含三表、RLS/admin只读、service-only invoker限流与30天清理函数。
- supabase/tests/ai_observability.sql 已有部分角色/反馈关联/限流事务检查。Controller审阅后要求补NULL/空bucket参数及完整角色/清理边界；远端尚未apply。
- 另要求补stream取消不触发flush的落库兜底，以及多步usage未知传播，避免遗漏取消或把部分用量当完整值。


### 2026-09-18 10:12 — 再次恢复并完成开发库首批验证

- 用户要求从中断继续；复用原实现代理。已核对两个Agent的observer.step注入落地，路由/UI未接入，未假称完成。
- 迁移已apply到开发库：远端版本20260918020821_ai_observability；要求本地仅同步文件名，后续DDL追加新迁移。
- 初稿SQL角色/FK/唯一/限流事务验证无错，rollback后三表均0行；无新增security WARN，ai_rate_buckets无客户端policy为service-only设计INFO。
- 5个MCP限流探针(limit2)测得2允许/3拒绝，测试bucket清理后0残留；工具实际可能串行，真实并发HTTP补验待做。
- 证据见 [database-verification.json](design/2026-09-17-evaluation-observability/database-verification.json)。
- 本轮typecheck失败2处：feedback的abortSignal在maybeSingle之后不被类型支持；rag adapter缺rrfScore。已交实现代理修复。


### 2026-09-18 10:16 — 扩展数据库权限与保留期验证通过

- 真实Postgres事务验证：anon/authenticated对三表写权限全部拒绝；匿名遥测读拒绝；ordinary/staff伪造user_metadata.admin仍不可读；admin可读runs/feedback。
- service角色CRUD、NULL/空bucket/limit0拒绝、超限拒绝、窗口重置、30天删除/反馈级联/新run保留全部通过。
- 独立查询确认3类probe残留均0。证据与完整SQL见 [database-extended-verification.json](design/2026-09-17-evaluation-observability/database-extended-verification.json)。这不是实际登录HTTP验证。
- 三个生成入口接入已落文件，继续补所有早退分支trace、缓存反馈语义及双端UI；尚未完成全量回归。


### 2026-09-18 10:17 — 观测接入首批自动验证通过

- 实现代理报告网站typecheck exit0（此前两处类型错误修复）；observer/Concierge安全/BookingInsight路由3文件35测试通过。
- 三生成入口观测、Concierge/Operations限流与trace头、两端Feedback UI及手动业务入口已落地，尚待端到端验证。
- 本地迁移已仅重命名为20260918020821，与远端版本一致。
- 下一步补BookingInsight早退和缓存receipt、反馈HTTP负例、E2E/live。F05-04/05仍进行中。


### 2026-09-19 14:11 — 精简上下文接续

- 用户再次要求继续。旧代理多次因usage limit失败，按技能异常替换规则换用 feature05_finish，提供完整剩余任务摘要；不重建既有代码。
- 2026-09-18 Controller曾实跑后台typecheck exit0；两端Playwright1.58.2依赖已安装，但尚无E2E/live新增文件。
- 本轮先运行两端完整test收集当前回归，继续反馈HTTP负例、E2E、live报告；不重复已通过的开发库迁移。


### 2026-09-19 14:11 — 当前全量单元测试结果

- 网站npm run test：35文件453测试全部通过，exit0（2026-09-19实际运行）。
- 后台npm run test：8文件中7过1失败，70测试中63过7失败；OperationsCopilot.test.tsx新增Link缺Router上下文，错误basename null，交接续代理修复。
- 不把过去70通过当本轮结果；E2E/live尚未补齐，Feature05仍未完成。


### 2026-09-19 14:17 — 后台回归修复

- 实现代理补Router/mock后全后台69/70通过，余下焦点环断言与新增业务Link不一致；随后补完整Tab/Shift+Tab路径。
- Controller实跑最新OperationsCopilot.test.tsx：10/10通过，exit0；不把分批结果写成新一次全套70/70。
- 新增网站tests/ai/feedback-route.test.ts（15项签名/过期/跨run/未知run/body/跨源/存储错误测试），执行中尚无结果。
- 接续补Eval schema/duplicate/真实多轮修改与生命周期中断用量边界。


### 2026-09-19 14:20 — 确定性测试与最新Eval报告

- 实现代理新批：反馈HTTP14项、observer13项、runner6项，合计33/33通过。此前预估15项反馈，以实跑14项为准。
- 已补重复ID/未知约束校验、连续两轮修改日期人数预算、首轮失败history说明；取消/超时usage用null避免部分累计冒充完整总量。
- Controller npm run eval:ai 首次因sandbox EPERM无法写报告；精确提升权限后exit0，6runner测试、69固定用例通过，latest报告时间2026-09-19T06:19:20.799Z。
- 这些仍是离线生产契约/fixture adapter证据。下一步实际页面E2E、显式live和真实并发HTTP，不提前关闭阶段。
