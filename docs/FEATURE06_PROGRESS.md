# Feature06 开发进度与接续记录

> 本文件是 Feature06「作品集与简历交付」在两个仓库间共享的唯一进度记录。
> 新对话先读本文件，再核对两个仓库的实际 Git 状态；不要把计划、fixture 或本地结果写成生产证据。

## 当前接续点

- 最后更新：2026-10-01（Asia/Shanghai）。
- 当前阶段：Feature06「作品集与简历交付」。
- 当前状态：F06-R5 功能点 1 的结构化经营查询、严格中文 booking-first 备注审批及 post-tool stop 修复均已完成 Production 人工验收，状态为 ✅ PASS。Deployment `dpl_41cma3wTBSRkFuWJgvbMPT9UiUHC` 为 READY，Production alias 返回 `200`；终检中审批卡在首个工具步骤后直接出现并可成功 Reject，已部署版本不再依赖第二次 provider 调用才能展示已创建的 approval。该结论不扩展为 Feature06 整体完成。
- 当前执行项：F06-R5 功能点 1 的本轮 Production recovery 已完成。严格 server-bound 备注请求在成功得到 `addBookingInternalNote` tool result 后立即终止 agent loop，trusted proposal/card 保持可见；普通经营查询仍保留多工具调用和后续模型综合。
- 下一步：继续 Staff 功能点 2 的 Production 桌面与窄屏人工 UI 验收，以及 Cron 启用态、录屏、三次计时和陌生读者验证等 Feature06 后续工作。
- 当前阻塞：F06-R5 功能点 1 当前无产品阻塞。Staff/Guest 本地环境仍指向旧开发数据库，无法替代其他 Production 身份与数据验收；Feature06 其余人工验收仍待完成。
- 正在运行的进程/测试：没有 dev server 或测试仍在运行。本批次最新核心目标测试 3 files / 337 tests、扩展目标测试 6 files / 349 tests 均通过；完整 `npm run check` 为 42 files / 672 tests，lint、typecheck、production build 全部通过，Guest/Staff `git diff --check` 通过。仅有既有 4 个 `<img>` lint warning、caniuse-lite 过期提示、Windows webpack cache rename `EPERM` 与本机全局 Git ignore 读取权限提示，均为非阻塞 warning。
- 安全边界：GitHub 发布、隔离 Supabase 写入和 Guest 首次 Vercel 发布已完成；任何跨平台 secret 传输都必须有明确授权，且不把 secret、密码和真实邮箱写入 Git、日志或本文件。不重跑付费 live eval；Cron 继续保持失败关闭。

## 项目与基线

| 项目 | 实际位置 | 职责 | 基线 HEAD | 2026-09-22 开始时状态 |
| --- | --- | --- | --- | --- |
| 运营后台 | `D:/working/code/17-the-wild-oasis-ai` | React/Vite 员工端、作品集主文档、本进度文件 | `b934a20` | dirty：Feature05 修改及未跟踪文件 |
| 顾客网站/BFF | `D:/working/code/21-the-wild-oasis-website-ai` | Next.js 顾客端、AI BFF、共享 Supabase 迁移和 Eval | `b37a5ca` | dirty：Feature05 修改及未跟踪文件 |

Feature06 开始前已经存在的 Feature05 改动属于用户资产；本阶段只叠加明确的 Feature06 文件，不清理或回退现有内容。

## 实时更新约定

- 每个有意义的实现批次、验证结果、失败或阻塞都追加到本文件，并更新当前接续点与任务表。
- 明确区分：静态/离线、HTTP fixture、真实模型、真实开发数据库、生产部署和人工验收证据。
- 未运行、因缺少配置跳过、失败和通过分别记录；生产 URL 未配置时 smoke 必须失败关闭或明确跳过，不能改打本地地址。
- 不记录凭据、Token、完整邮箱、真实个人信息、模型原始敏感输入或演示账号密码。
- 只有真实报告已测量的数字可写入简历；成本未知就是未知，不能写为 0。

## 需求文件清单与落点

| 需求 | 计划落点 | 初始状态 |
| --- | --- | --- |
| 两端统一 README | 两仓库 `README.md` | 已有 Feature01–05 技术内容；待重构入口与双端叙事 |
| Case Study | `docs/portfolio/CASE_STUDY.md` | 待创建 |
| 三段式演示脚本 | `docs/portfolio/DEMO_SCRIPT.md` | 待创建 |
| AI Eval 报告 | `docs/portfolio/AI_EVAL_REPORT.md` | 待创建，引用既有原始报告 |
| 简历 bullet | `docs/portfolio/RESUME_BULLETS.md` | 待创建 |
| 部署与演示数据说明 | `docs/portfolio/DEPLOYMENT_RUNBOOK.md`、两端配置/环境示例 | 待创建/修改 |
| 架构图 | 文档 Mermaid + `docs/portfolio/assets/architecture.svg` | 待创建 |
| 截图 | `docs/portfolio/assets/screenshots/` | 待从现有 fixture E2E 证据复制并准确标注 |
| 备用录屏 | 录制清单、版本化说明；实际视频由真人录制 | 阻塞：没有真实录屏素材 |
| Markdown link check | 本地脚本与两端 npm 命令 | 待创建 |
| 生产 smoke | 仅接受显式真实 HTTPS URL 的脚本/命令 | 待创建；实际运行阻塞 |

## 任务拆分与验收

| ID | 任务 | 状态 | 完成条件 / 证据 |
| --- | --- | --- | --- |
| F06-00 | 基线、范围、文件清单与跨对话入口 | 已完成 | 本文件、两端 AGENTS 指向本文件、dirty 基线已记录 |
| F06-01 | 统一项目叙事与双端 README | 已完成 | Case Study 与两端 README 包含业务、关系、架构、取舍、测试、角色、限制/未来工作 |
| F06-02 | 部署配置、环境边界与演示数据保护 | 已完成（Cron 验收除外） | 双端 Vercel production、exact-origin 绑定、env 边界与浏览器 smoke 已验证；安全 reset 仍默认关闭，待受保护手动调用 |
| F06-03 | 三段式演示、失败场景、截图与录屏清单 | 阻塞（外部） | 5 分钟脚本、失败场景、fixture 截图与 manifest 已完成；实际录屏/三次计时/陌生读者待人工 |
| F06-04 | Eval 报告与可追溯简历表述 | 已完成 | 每个数字链接真实报告；分批 live 口径准确；成本保持 unknown |
| F06-05 | 链接检查、smoke 工具、两端完整检查与收尾自审 | 已完成（生产脚本部分受本机网络阻塞） | 双端链接/完整 check、smoke 失败关闭、Guest 仓库 production smoke 与双端浏览器生产验证通过；Staff 仓库 smoke 本轮受终端 TLS 阻塞 |
| F06-R1 | 修正 Briefing/Copilot 演示角色 | 已完成（本地范围） | 新增 DEMO_ADMIN，保持生产 admin-only Briefing 权限不变 |
| F06-R2 | 安全定时演示数据恢复链 | 已完成（Cron 启用态待验收） | 固定 provenance、私有 baseline、service-only RPC、默认关闭 Cron route 与 SQL/TS 测试已落盘；隔离项目 rollback-only SQL 已通过 |
| F06-R3 | 独立仓库公开链接稳定化 | 已完成 | 两个独立 GitHub origin 已发布，跨 sibling 文档链接使用固定 `main` 绝对 URL 并通过检查 |
| F06-R4 | Sequence 权限与 migration 初始化顺序 | 已完成（本地范围） | service_role 获得 `setval` 所需 UPDATE；SQL/合约断言；所有 versioned migrations 按文件名应用且不跳过中间迁移 |
| F06-R5 | Copilot 中文安全语法、隐私安全备注与结果抽屉可读性 | 功能点 1 Production 人验与 post-tool stop 终检 ✅ PASS；功能点 2 spec ✅ PASS、quality ✅ APPROVED、已发布 | 结构化查询、中文备注 Reject → 新建 approval → Approve 及单步返回审批卡均通过；Staff 抽屉仍待 Production 桌面/窄屏人工 UI 验收 |

## 已知证据边界

- 固定离线 Eval：69 条；工具选择 45/45、硬约束 69/69、引用 24/24、授权 64/64。这是离线契约/合成检索证据，不是模型准确率。
- 真实模型首批 10 个固定场景为 8/10，P50 `7807 ms`、P95 `20264 ms`；两个失败分别在后续单场补验通过。准确表述只能是“10 个不同固定场景分批取得通过”，不能写成单次 10/10。
- 成本没有经核验的价格文件，因此为 unknown/未测，不是 0。
- 两端浏览器各 5/5 使用 HTTP fixture；真实拒绝 HTTP 和真实开发数据库并发限流是不同证据层，不能混写成生产 E2E。
- 双端已有真实 production URL；Guest 仓库 smoke 已通过，Staff 已有浏览器生产验证，但 Staff 仓库 smoke 本轮受本机 TLS 链路阻塞，不能登记为脚本通过。仍没有可公开演示账号、录屏或三次真人计时证据。

## 变更日志

### 2026-10-01 — post-tool stop 最终 Production 复验通过

- Guest/BFF deployment `dpl_41cma3wTBSRkFuWJgvbMPT9UiUHC` 状态为 READY，正式 Production alias 返回 `200`。
- Production 终检提交严格命令“为预订 699 起草内部备注：F06-R5 终检——确认审批单步返回。”后，准确审批卡直接出现，没有等待或依赖工具成功后的第二次 provider 综合调用。
- 点击 **Reject draft** 成功，toast 为 `Draft rejected; no booking field changed.`，审批卡显示 `Decision: rejected`。该结果同时确认审批拒绝仍保持零 booking 字段写入，post-tool stop 没有改变既有审批语义。
- 这组部署与真实 Production 证据验证 post-tool stop 修复已经上线生效，关闭“pending approval 已持久化但后续 provider `429/503` 使 route 失败、UI 看不到审批卡”的质量缺口。F06-R5 功能点 1 恢复为 ✅ PASS；证据范围不扩展到 Staff 功能点 2 或 Feature06 其他待完成人工验收。

### 2026-10-01 — 备注审批成功后的 post-tool provider 失败窗口修复

- 质量复审发现 Important：严格备注命令的首步 `addBookingInternalNote` 已经通过 RPC 创建 pending approval/audit 后，AI SDK 仍会发起第二次 provider 调用。若第二步遭遇 Gemini `429/503`，admin route 会返回失败，但数据库中已有 UI 未展示的 pending approval；此前 Production 重新提交时出现的 provider 故障使该窗口具有实际风险。质量状态因此重新打开。
- 核对本地 `ai@7.0.58` 源码确认，`stopWhen` 在工具执行并记录完整 step/tool result 之后、下一次 provider 调用之前评估，generate 与 stream 语义一致。本地新增停止条件只在 server-bound draft 存在且最新 step 成功产出 `addBookingInternalNote` tool result 时触发；失败的工具执行不被当成成功，普通经营查询仍沿用最多 8 steps 并保留 tool 后的模型综合。
- 真实 SDK generate 测试从两次 provider 调用改为一次，仍断言 RPC 恰好一次、raw proposal 包含准确 note、模型输入不含准确 note；新增模拟第二次 provider `503` 的回归测试，证明第二次调用不会发生且结果成功保留 proposal。真实 UI stream 测试同样只调用 provider 一次，配置的第二次 `429` 不可达，HTTP response 为 `200` 且 `tool-output-available` 仍含 trusted approval card payload。既有三工具经营查询明确继续执行第二次模型综合调用。
- 最新核心目标测试 3 files / 337 tests、扩展目标测试 6 files / 349 tests、完整 `npm run check` 42 files / 672 tests、lint、typecheck 与 production build 全部通过。该时点修复尚未提交、推送或部署；后续 deployment 与 Production 终检已通过，见上方记录。

### 2026-10-01 — 中文 booking-first 备注审批 Production 人验通过

- Guest/BFF deployment `dpl_buMsMyRsa1FBhtwtsu9p15k5NXyY` 上，严格命令“为预订 699 起草内部备注：F06-R5 验收——请在入住前跟进付款。”成功生成审批卡，卡片展示准确 note，而不是 `[redacted]`。
- 点击 **Reject draft** 成功，toast 为 `Draft rejected; no booking field changed.`，审批卡显示 `Decision: rejected`。该 approval 进入 terminal rejected 状态，订单字段不变；后续批准必须重新提交命令并创建新的 approval，这是预期的不可复活安全边界。
- 重新提交期间曾短暂遭遇 Gemini 上游 `503` 与 `429`，对应 References `6a8d...` 与 `5f882f...`；后续重试成功生成新的审批。它们属于外部可恢复的 provider 暂时不可用/限流故障，不是审批门控或准确备注绑定失败。
- 对新 approval 点击 **Approve note** 成功，toast 为 `Internal note added.`，审批卡显示 `EXECUTED` 与 `Decision: executed`，准确 note 已写入 Booking `#699`。这组真实 Production 证据证明严格中文命令解析、受信审批卡准确正文、Reject 零订单写入、重新创建 approval 与 Approve 执行路径均通过；证据范围不扩展到 Feature06 其他尚未完成的人工作业。

### 2026-09-30 — 中文备注跨语言第二命令边界规格修复

- 首轮规格复审未通过：booking-first 中文备注的 trailing-command 检查只在部分中文切换路径识别第二条严格备注命令，`private then 为订单700起草内部备注：second` 与 `private并为订单700起草内部备注：second` 可能被误绑定为第一条 note，进而到达 approval RPC。
- 本地修复在所有已支持的显式分隔符、英文 `then/and then` 与中文强切换路径上检测严格 booking-first 中文后缀；裸 `并` 使用独立窄规则，只有后缀完整匹配“为订单/预订/booking id + 正整数 + 起草/草拟备注 + 正文”时才拒绝，不把普通 `并` 加入通用命令切换。既有“联系前台并查询付款状态”等自然正文仍合法。
- 新增 parser undefined、sanitizer 固定 fallback 与真实工具层 query/RPC 均为 0 的对抗测试，覆盖英文跨语言切换、复合 `and then`、裸 `并`、空格与显式标点变体。最新核心目标测试 3 files / 336 tests、扩展目标测试 6 files / 348 tests、完整 `npm run check` 42 files / 671 tests、lint、typecheck 与 production build 全部通过；本地仍未提交、推送或部署，等待规格重新审查与后续 Production 复验。

### 2026-09-30 — Production 中文 booking-first 备注草稿验收失败与本地修复

- Production 人工验收提交“为预订 699 起草内部备注：F06-R5 验收——请在入住前跟进付款。”后，只返回 generic numeric bookingId 能力说明，没有生成审批卡或进入 Reject，因此该新增中文备注命令验收点未通过。
- 根因是 Guest/BFF 严格中文备注 parser 与 model-facing redactor 只接受“添加/创建/写入/草拟内部备注……订单/预订 ID……”的 verb-first 语序，不接受“为预订 ID 起草内部备注……”的 booking-first 语序；请求因 fail-closed sanitizer 被替换为固定 bookingId fallback。该故障不改变此前已通过的结构化经营查询证据。
- 本地修复仅增加严格锚定的“为预订/订单/booking id + 正整数 + 起草/草拟 + 可选内部 + 备注 + 正文”语法。原始 envelope 可绑定准确 note，但 model-facing 文本固定规范化为 `Draft internal note bookingId=699: [redacted]`；未把“起草”加入通用中文 allowlist。非法/缺失/零/负数/过长 ID、空或超 500 字 note、尾随运营命令/第二条备注/政策查询、相邻姓名或邮箱及非命令自然语言均继续失败关闭，并在工具查询/RPC 前拒绝。
- 真实 SDK 受控模型与 route 合约继续验证：首步只允许 `addBookingInternalNote`，模型 tool input 仅含 bookingId；准确正文只出现在受信服务端绑定、审批 RPC 与授权 UI raw proposal，不进入任何模型调用或 observability。核心目标测试 3 files / 326 tests、扩展目标测试 6 files / 338 tests、完整 `npm run check` 42 files / 661 tests、lint、typecheck、production build 与 Guest/Staff `git diff --check` 均通过；仅有既有非阻塞 warnings。本地改动尚未提交、推送或部署，必须部署后用同一句命令完成审批卡、Reject、重新 Draft+Approve 的 Production 复验，不能把本节登记为恢复通过。

### 2026-09-30 — 第三次 Production 结构化经营查询复验通过

- Guest/BFF deployment `dpl_6zrTEzEGZhAbrcLcYuQ3pANT1KEk` 已 Ready，正式 Production alias 为 [`https://the-wild-oasis-website-ai.vercel.app`](https://the-wild-oasis-website-ai.vercel.app)。
- 用户以同一句中文经营查询完成第三次真实 Production 人工复验：界面成功显示 Summary metrics 与中文 AI explanation；Data activity 明确显示 Booking metrics、Arrival lookup、Booking risk review 三个工具全部 completed；Reference 为 `aec9c64c-8691-4c9f-a362-a43478322b75`。
- 该证据足以把本轮结构化经营查询验收点恢复为 ✅ PASS，并证明此前 sanitizer 降级、provider 503 与 60 秒 step timeout 修复后的端到端路径可用。证据范围仅限此查询链路；Staff 功能点 2 桌面/窄屏 UI、Cron 启用态、录屏、三次计时和陌生读者验证仍未完成，不能宣称 Feature06 全部验收完成。

### 2026-09-30 — Production 第二次复验命中 60 秒 step timeout

- 第二次 Production 人工复验仍未得到结构化经营结果。Reference `fd8064ac-465d-40f4-a6b8-cd5d048d5637`、deployment `dpl_7wpch28xLeDooW3EwZbrU2o3S6RR` 的精确脱敏日志为 `TimeoutError`、diagnostic code=`timeout`、status/retryable=`null`、durationMs=`60011`、HTTP `504`、mode=`generate`；provider `503` 已不再是这次请求的外层最终错误。时长精确对应现有 `CONCIERGE_GENERATE_TIMEOUT.stepMs=60_000`，总截止仍为 90 秒，Vercel route `maxDuration` 为 100 秒。
- 本地 `ai@7.0.58` 源码确认 ToolLoopAgent 的 `reasoning` 是正式 call setting；non-stream `stepMs` 包住每一步 provider 调用及其有限 retry，而 `totalMs` 独立限制完整 agent。`@ai-sdk/google@4.0.42` 源码确认 Gemini 3+ 会把顶层 `reasoning: low` 映射成 `thinkingConfig.thinkingLevel=low`。据此只为 Operations agent 设置 low reasoning，不改变 booking insight 或 concierge；non-stream generate 调为 80/90/20，stream 继续保持 total/step/firstChunk/chunk/tool = 90/60/60/30/20，`maxRetries=4` 不变。
- 真实 SDK + MockLanguageModel 虚拟时间契约覆盖两个路径：70 秒首个 provider step 在旧 60 秒点仍未终止，随后完成 metrics/arrivals/risks 三个只读工具；另一条累计路径仍在完整 90 秒 total deadline 终止。测试同时锁定 Operations `reasoning=low`、Concierge 不受影响、generate 80/90/20、stream 配置不变，不执行真实网络或数据库写入。
- 最新定向 6 files / 309 tests、Guest 全量 42 files / 632 tests、lint、typecheck 与 production build 全部通过；仅有既有非阻塞 warning。该时点本地批次尚未部署，因此本节本身不构成功能恢复证据；后续 deployment `dpl_6zrTEzEGZhAbrcLcYuQ3pANT1KEk` 与第三次人工复验结果见上方记录。

### 2026-09-30 — Production 503 消失，中文聚合经营查询 sanitizer 降级修复

- Production 人工复验提交“请查询2026年9月1日至2026年9月30日的订单、收入、到店情况和高风险订单，并说明统计口径。”，Reference 为 `2e5243a0-1619-4fc7-88cf-5dae86e843dc`。请求不再返回 `503`，证明 Gemini 3.8 + 有限重试修复已生效；但响应是英文 generic booking-ID/privacy capability acknowledgement，没有 metrics、arrivals 或 risks 结构化结果，因此本次人验仍未通过。
- 真实 sanitizer 黑盒测试先复现完整原句被替换为 `Booking lookup requires a numeric bookingId...`，并逐项证实中文日期、“情况”、“并”、“说明”、“口径”在旧语法下均失败关闭。源码组合检查进一步确认 `请查询` 被较短 `请查` 分支先匹配，最终未消费文本精确为 `询2026年9月1日2026年9月30日情况并说明口径`；这解释了模型为何只能围绕 numeric bookingId 能力作答。
- 本地最小修复只接受完整 `请查询`、`到店情况`、`并说明`、`统计口径` 以及完整 `YYYY年M月D日` token，不放行任意 Han。两段中文显式日期由服务端验证并规范化为 ISO `from=2026-09-01, to=2026-09-30`；单独“情况 / 并 / 说明 / 口径”、相邻中文姓名、既有 PII/脚本/长度边界继续失败关闭或脱敏。
- 规格复审指出首版中文日期 token 化仍可能把 invalid day/month、倒序、超 366 天或缺少第二个端点的原文送入 model，只是不给 date hint，因此首轮复审未通过。本地修复现于 note 正文脱敏后、任何 date token 化前检查中文显式日期：只有 `extractExplicitOperationsDateRange` 能验证并规范化的唯一日期对才继续，其余一律返回固定安全 fallback；不扩展单日期语义，也不改变既有 ISO/相对日期行为。新增 sanitizer 与 `readOperationsRequest` 端到端负测覆盖四类非法范围及单日期，并直接构造裁剪点落在中文日期内部的边界，确认不会输出半个日期。该修复仍待重新规格/质量审查、提交、部署及 Production 复验，不能登记为通过。
- 无网络真实 ToolLoopAgent + 受控模型契约证明，该清洗后的原句能在一个模型步骤调用 `getBookingMetrics`、`getArrivals`、`getBookingRisks`，三个 tool result 均返回；重试、审批、工具副作用和隐私边界未改。现有 operations instructions 已明确聚合经营查询使用 structured tools，测试没有证明需要新增危险的文本驱动 tool forcing，因此 prompt 未改。
- 截至 sanitizer/date 批次，定向 5 files / 304 tests、Guest 全量 42 files / 630 tests、lint、typecheck 与 production build 全部通过；仅有既有非阻塞 warning。当时 Guest/BFF 共 8 个文件未提交，未推送、未部署；该证据已由上方后续 timeout 批次继续叠加，本节不构成功能恢复证据。

### 2026-09-29 — Gemini 上游 503 确证与有限重试韧性修复

- 已部署的脱敏诊断为 Production Reference `5b790313-f0cd-49de-b1ff-e09ada442a02` 记录：`AI_RetryError`、code=`provider-http`、status=`503`、retryable=`true`、durationMs=`9480`、route=`/api/ai/admin`、mode=`generate`。该证据排除 UI/CORS/数据库/路由，把失败类别确证为 Google Gemini 上游临时 `503`；受控日志不包含用户问题、Authorization、API key、provider 原始 message/body 或 PII，也不足以进一步断言具体过载原因。
- Google 官方 Gemini troubleshooting 将 `503 UNAVAILABLE` 定义为应重试的临时错误，建议仅对 `429`、`408` 与 `5xx` 使用有最大次数的指数退避；官方模型目录截至 2026-09-29 将 `gemini-3.8-flash` 列为最新稳定 Flash、`gemini-3.6-flash` 列为 previous-generation。来源：[Troubleshooting guide](https://ai.google.dev/gemini-api/docs/troubleshooting)、[Models](https://ai.google.dev/gemini-api/docs/models)。
- Guest/BFF 本地将 direct Google 默认模型升级为 `gemini-3.8-flash`，不改变 `AI_CONCIERGE_MODEL` 显式覆盖；concierge 与 operations 共享 `CONCIERGE_MODEL_MAX_RETRIES=4`。本地 `ai@7.0.58` 源码确认 retry 使用 SDK 内置指数退避，且仅重试每个 step 的 provider `doGenerate`/`doStream`，在工具调用解析与执行之前；不会以整次 agent 重跑的方式重复工具写入，仍受既有 60 秒 step、90 秒 total timeout 与 request abort 截止。
- 新增真实 SDK retry 契约测试：两个 agent 都在连续 4 次 retryable provider `503` 后第 5 次 attempt 成功；Operations 在重试期间 booking query 与 RPC 均为 0。默认模型与显式 override 均有覆盖，已有审批、隐私、工具和安全响应测试保持通过。定向 4 files / 238 tests、单独 typecheck、Guest 全量 42 files / 614 tests、lint、typecheck 与 production build 全部通过；仅有既有非阻塞 warning。
- 本轮 Guest/BFF 修改 4 个既有文件并新增 1 个测试文件，尚未提交、推送或部署。当前仍待审查与部署后用原中文经营查询完成人工复验；本节不构成 Production 恢复证据。

### 2026-09-29 — Production `/api/ai/admin` 503 安全诊断与 generate 超时兼容修复

- Staff Production 验收中文经营查询时，`POST /api/ai/admin` 返回 `503`，request ID 为 `4nl9z-1790684841062-370e5592fe75`；同路由 `OPTIONS` 返回 `204`。Vercel 日志证明请求已进入 Google Generative AI / `gemini-3.6-flash`，并记录 `timeout.firstChunkMs`、`timeout.chunkMs` 不支持非流式 generate 的 warning，但旧 admin route catch 吞掉了真正异常。
- 核对本地 `ai@7.0.58` 源码与文档后确认：`firstChunkMs` 和 `chunkMs` 仅由 streaming 使用，generate 会记录 unsupported warning 而不会因此抛错。本地修复让非流式 `agent.generate` 保留受支持的 `{ totalMs: 90_000, stepMs: 60_000, toolMs: 20_000 }` 及原有 request abort，只移除两个 streaming-only deadline；stream 继续使用 total/step/first-chunk/chunk/tool 完整配置。当前不能把该 warning 写成 503 根因。
- admin generation catch 新增 JSON 结构化服务端诊断，字段严格固定为 level/event/route/surface/traceId/mode/errorName/code/status/retryable/durationMs。error name、network/provider 分类均经过白名单或本地枚举映射，provider HTTP status 只接受 `400..599`；不读取或记录 error message、用户问题、Authorization、API key、原始 provider response body、任意 provider code、stack 或 PII。安全属性读取会同时有界遍历 `cause` 与 `lastError`（固定深度与节点上限），跳过 throwing getter/Proxy trap 并阻断 cycle；helper 与 route/logging 外层均有稳定 fallback，客户端仍收到原有安全 503/504 文案与 trace。
- 对抗测试用含邮箱的用户问题、Bearer token、任意 provider code 与原始 provider body 验证日志和响应均不含这些值；另覆盖 throwing getter、全属性抛错 Proxy、cause/lastError 循环、HTTP status 边界及日志自身失败，并验证 generate 保留 total/step/tool timeout、stream 完整配置不变。最新针对性测试 1 file / 21 tests、单独 typecheck、Guest 全量 41 files / 612 tests、lint、typecheck、production build 与 `git diff --check` 全部通过；仅有既有非阻塞 warning。
- 本轮涉及 4 个 Guest/BFF 文件（修改 3 个、增加 1 个安全诊断模块）。修复已以 commit `3aaa959`（`fix: diagnose operations generation failures`）由 GitHub 自动部署到 `the-wild-oasis-website-ai` Production，Vercel 状态 Ready、构建约 44 秒；该截图证据只证明部署成功，不构成 503 恢复或根因确认。当前仍待用相同中文经营查询完成 Production 功能复验，若失败再依据新日志定位真实异常；Staff 功能点 2 人工 UI 验收继续保持未完成。

### 2026-09-29 — F06-R5 功能点 2 已提交、推送并部署到 Staff Production

- 功能点 2 已以 commit `990c4d7fbc068fdef0fdf132d406f7d2ccabb687`（`feat: structure Operations Copilot results`）提交并推送。
- 已部署到现有 Vercel 项目 `chenjz69921-3115s-projects/the-wild-oasis-ai`（projectId `prj_ZF9gnbzFkAuLIWsqSmnHmqLdHXYP`）。Deployment inspect ID/slug 为 `HA39wqKkVmRvSHJ1KFaQYm44Zpy9`，deployment URL 为 `https://the-wild-oasis-qip95gv68-chenjz69921-3115s-projects.vercel.app`，Production alias 为 `https://the-wild-oasis-ai.vercel.app`。
- Vercel 部署状态为 Ready，构建耗时 33 秒。这是发布状态证据，不是人工 UI 验收证据。
- Production 桌面与窄屏人工 UI 验收仍待用户完成；在用户实际核对结构化结果层级、审批优先、折叠行为、terminal 禁用态和横向溢出前，不宣称功能点 2 已通过人工验收。

### 2026-09-28 — F06-R5 功能点 2 quality review 通过

- 独立 quality reviewer 最终结论为 ✅ APPROVED，没有 Critical 或 Important 问题。功能点 2 现已同时通过最终 spec review 与 quality review。
- 独立验证证据：目标组件测试 18/18、typecheck、对本轮变更 TSX 的显式 ESLint、production build 与 `git diff --check` 均通过；本节仅记录 reviewer 已执行的结果，没有在此文档更新步骤中重跑测试。
- 三个非阻塞 minor 留作后续优化：textarea 当前允许无限纵向 resize，可考虑增加 `max-height`；E2E 当前直接覆盖 `390px` 窄屏，尚未直接覆盖 `320px` 或超长内容压力 fixture；正式 `npm run lint` 脚本只匹配 JS/JSX，但本轮已额外对变更 TSX 执行显式 ESLint 并通过。
- 当前代码和文档仍未提交、未推送、未部署。下一步等待用户确认 commit/push，随后部署到现有 Staff Production；Production 桌面与窄屏人工验收仍需在部署后执行，不能用双审或自动化证据替代。

### 2026-09-28 — F06-R5 功能点 2 最终 spec review 通过

- 原 spec reviewer 对 booking 分类空态修复完成复审，最终结论为 ✅ PASS。首轮发现的“任意空 output 导致混合数据场景误报空态”问题已修复：Arrivals 与 Bookings needing attention 分别聚合判空，同类存在数据时不显示该类空态，两类全空时只显示一个合并空态，规范外 `Bookings` 标题已移除。
- 最新自动化证据保持为：目标组件测试 18/18；Operations fixture E2E 7/7；完整 `npm run check` 为 8 files / 78 tests，lint、typecheck、production build 通过；`git diff --check` 通过。本节记录 reviewer 结论，没有重新运行或虚构新的测试批次。
- 真实本地人验当前不成立：Staff/Guest 本地配置指向旧开发数据库，且没有 Production Demo staff/admin 身份。按用户此前同意的流程，先执行 quality review；通过后等待用户确认 commit/push，部署到现有 Staff Production，再进行桌面与窄屏人验。不会复制 Production secret 或为旧开发环境临时创建演示账号。
- 当前功能点 2 代码和文档仍未提交、未推送、未部署；本节不构成 Production 人工验收证据，也没有执行远端数据写入。

### 2026-09-28 — F06-R5 功能点 2 首轮 spec review 分类空态修复

- 首轮 spec review 发现重要问题：原编排器以“任意 booking output 为空”触发全局空态，因此同类或另一业务类别已有数据时仍可能显示错误的 “No matching...” 结论，并新增了规范外的 `Bookings` 标题。
- 修复后先分别聚合 `Arrivals` 与 `Bookings needing attention`：类别内存在任一数据时只展示数据，不再显示该类空态；类别全部为空时才显示类别空态；两类同时全部为空时只显示一个合并空态，且不再输出 `Bookings` 分组标题。
- 混合场景中的空 output 不再产生错误业务结论，但其 `truncated` warning 与 Evidence 仍保留；规定的 Arrivals → Bookings needing attention 顺序保持不变。
- 新增回归覆盖：同类一空一非空、arrivals 空但 attention 非空且顺序正确、两类全部为空只合并一次。目标组件测试 18/18、Operations fixture E2E 7/7、完整 `npm run check` 8 files / 78 tests、lint、typecheck、production build 与 `git diff --check` 均通过。当前等待原 reviewer 复审，不把修复与自动化证据写成 spec PASS。

### 2026-09-28 — F06-R5 功能点 2 本地实现与自动化验证完成

- 精确安装并锁定 React 18 兼容的 `react-markdown@10.1.0`；AI 正文仅允许基础排版元素、忽略原始 HTML、剥离链接和图片节点，并将模型 `h1/h2` 降级为抽屉内 `h3/h4`。结构化结果存在时，AI explanation 默认折叠。
- 新增结构化结果编排器，固定为审批 → 经营结果 → AI explanation → Data activity → Continue/反馈/reference；KPI 的零值仍展示，多个空 arrivals/risks/details 只形成一条业务空态，Evidence 与 partial warning 仍保留。
- terminal approval 继续禁止重复决策，同时改为灰色卡片、状态标签和明显 disabled 按钮；准确 note、既有审批 API 和 toast 行为保持不变。
- 抽屉改为 `100dvh`、最大 `56rem`，header/form 固定，内容独立滚动；KPI、chart、长 ID、长正文和操作按钮都增加窄屏换行/重排，Close 目标尺寸至少 `44x44`。
- `react-markdown` 改为 response 时按需加载，production build 将其隔离为约 `118.67 kB`（gzip `36.61 kB`）的独立 chunk；最终 build 没有 chunk-size warning。
- 初始自动化证据：目标组件测试 16/16（分别覆盖 rejected 与 executed terminal 状态）；Operations fixture E2E 7/7，覆盖桌面与 `390x844` 的审批优先、活动折叠、无横向溢出、44px Close、焦点和 Escape；完整 `npm run check` 为 8 files / 76 tests，lint、typecheck、production build 通过；后续 reviewer 修复后的最新证据见上一节。
- 项目原 `playwright.config.ts` 在本机失败重跑后出现 Vite child teardown 不退出；最终 E2E 使用同一 fixture env 手动启动 Vite，并用临时无 `webServer` 配置运行，命令 exit `0`。临时配置、dev server 与测试生成的旧截图改动均已清理，未把环境 teardown 当成产品通过证据。
- React 自审确认无请求瀑布或新全局 listener；重型 Markdown 依赖按需分块，派生结构化状态在 render 中计算，焦点/对话框语义和已有 API 边界保持不变。没有提交、推送、部署或 Production 写操作。

### 2026-09-28 — F06-R5 功能点 1 Production 人验通过

- Production Staff 会话中，中文经营查询“对比本月入住相关订单和收入，并列出需要关注的订单。”成功返回，中文请求链路通过。
- Booking `#699` 的第一次成功 internal note 草稿生成了审批卡，卡片准确显示 note `Follow up on payment before check-in.`，不是 `[redacted]`，证明服务端准确备注绑定能够到达受信审批 UI。
- 点击 Reject 后，toast 显示 `Draft rejected; no booking field changed.`，审批卡显示 `Decision: rejected`。该 rejected approval 已进入 terminal 状态，不能再被 approve；这是预期的安全行为，不是故障。
- 使用同一 note 再次 Ask Copilot 创建新的 approval 后，Approve 成功；toast 显示 `Internal note added.`，新审批卡显示 `Decision: executed`。必须新建 approval 才能在 Reject 后 approve，符合审批不可复活与每次决策独立的设计。
- F06-R5 功能点 1 的 spec review、quality review 与 Production 人工验收均为 ✅ PASS，现标记完成。审批按钮在 terminal 状态下的禁用视觉不够明显，以及抽屉文本/Markdown/结构化内容层次混乱，均纳入功能点 2；当前接续点转入结构化结果抽屉实现。

### 2026-09-28 — F06-R5 Production 人验：中文链路通过，备注草稿请求待诊断

- 在现有 Production Staff 会话中提交“对比本月入住相关订单和收入，并列出需要关注的订单。”后成功返回，说明此前失败的自然中文经营请求链路已通过本轮人工验证。
- 同一截图再次确认结果抽屉仍存在文本、Markdown 与结构化 UI 混杂、层次混乱的问题；该问题明确留给 F06-R5 功能点 2，不在当前 BFF 功能点 1 中扩张范围。
- internal note 草稿请求在浏览器显示 `Failed to fetch`，没有出现审批卡；因此 Reject、再次 Draft 与 Approve 均未执行，准确备注与审批副作用尚未获得 Production 人工证据。F06-R5 功能点 1 的 Production 人验当前未通过/未完成，不能用 spec/quality review 或自动化测试替代。
- 只读诊断确认 Production BFF 预检 `OPTIONS` 返回 `204`，允许 Staff origin、`Authorization` 与 `Content-Type`；未认证 `POST` 返回带 CORS header 与 trace 的 `401`。这排除了静态 CORS 配置错误和路由不可达，但不能解释已认证浏览器请求为何 `Failed to fetch`。
- Vercel runtime log connector 因 `403` 无法读取对应请求日志；当前等待用户重试 internal note 请求或提供对应浏览器/请求日志，再决定是否需要代码修复。没有执行 Reject/Approve、数据库写入或代码修改。

### 2026-09-28 — F06-R5 功能点 1 通过质量复审，人工验收延期至 Production 部署后

- F06-R5 功能点 1 的最终 spec review 与 quality review 均为 ✅ PASS。安全复审补齐了 trailing command 的中英文强连接词/显式分隔符边界、全部 Operations tool 对象、bounded policy/SOP 主题语法、同一步 one-shot 写门禁，以及多行敏感值的递归 payload 检查；准确备注仍只存在于受信服务端绑定、审批 RPC 与授权 UI raw proposal 中。
- 自动化证据：目标测试 3 files / 274 tests 通过；Guest 全量 `npm run check` 为 41 files / 605 tests，lint、typecheck、production build 通过；单独 typecheck 与 `git diff --check` 通过。仅有既有 4 个 `<img>` lint warning、caniuse-lite 过期提示和 Windows webpack cache rename `EPERM`，均为非阻塞 warning。
- 用户已明确同意：由于 Staff/Guest 本地数据库环境与 Production Demo 不一致，不临时改 env 或复制 secret，将人工验收延期到提交并部署 Guest/BFF 到现有 Vercel Production 之后。部署完成后使用现有 Production Staff 会话验证中文生产原句、Booking `699` Reject、再次 Draft 后 Approve，并复核准确备注、拒绝零副作用和批准只修改 `internalNote`。
- Guest/BFF 当前仍有 8 个功能点文件未提交、未推送；Production 尚未更新，仍运行旧版本。本节只记录本地 review 与自动化证据，不构成部署或 Production 人工验收通过。没有修改数据库 schema、migration、RLS、授权模型或远端数据。

### 2026-09-27 — F06-R5 本地人验因环境项目不匹配安全停止

- 准备本地验证生产失败中文原句与 Booking `699` draft Reject/Approve 时，确认 Staff 与 Guest 的本地 env 彼此一致，但均指向旧开发项目 `LOCAL_DEV_PROJECT`，不是 Feature06 隔离 Demo；因此本地不存在此前用于验收的 Demo staff/admin 身份，未执行本地人验。
- 为避免把旧开发项目或错误身份当作隔离 Demo，没有创建账号、修改 env、传输 secret 或写入数据库。两个本地 dev server 已停止，端口 `3000` 与 `5173` 已释放。
- 当前等待用户在两条安全路径中选择：一是显式授权临时同步本地 Staff/Guest Demo env 后再做人验；二是保持本地 env 不变，将人验延期到 quality review、提交和部署完成后的 Production。当前 Production 仍运行旧版本，本节不构成部署或生产验证证据。
- F06-R5 功能点 1 的最终 spec review 仍为 ✅ PASS；目标 3 files / 233 tests、Guest 全量 41 files / 564 tests、lint、typecheck、production build 与 `git diff --check` 证据保持不变。本次只记录人验阻塞，不重跑测试。

### 2026-09-27 — F06-R5 功能点 1 BFF 完成并通过最终规范复审

- Guest/BFF 完成 F06-R5 功能点 1：只增加完整、已知安全的中文经营短语；生产失败原句“对比本月入住相关订单和收入，并列出需要关注的订单。”保留经营意图，“本月”由服务端按 UTC 月首至月末解析，姓名、邮箱、电话与自由文本仍保持脱敏或失败关闭。
- 内部备注改为严格解析原始 request envelope 的最新 submit user 文本，并只在服务端闭包绑定；regenerate、assistant-tail、畸形命令、错误 bookingId 与重复/并行写均在查询或 RPC 前失败。模型消息与 `addBookingInternalNote` 输入只含 bookingId 和 `[redacted]`，准确备注不进入日期提示、后续模型上下文或 observability。
- `toModelOutput` 只向模型返回不含 note/approvalId 的安全摘要；真实 AI SDK `7.0.58` UI stream 合约测试确认授权 `tool-output-available` 仍保留准确 note 与 approvalId。审批 RPC、数据库 schema、migration、RLS 与授权模型均未修改。
- 本批次修改 8 个 Guest 文件：`app/_ai/operations-request.ts`、`app/_ai/operations-types.ts`、`app/_ai/operations-tools.ts`、`app/_ai/agents/operations-agent.ts`、`app/api/ai/admin/route.ts`、`tests/ai/operations-route-security.test.ts`、`tests/ai/operations-tools.test.ts`、`tests/ai/generation-observability-route.test.ts`。
- 最终 spec review 结论为 ✅ PASS。目标测试 3 files / 233 tests 通过；Guest 全量 41 files / 564 tests、lint、typecheck、production build 与 `git diff --check` 全部通过。没有执行数据库/schema/RLS 修改、远端 Supabase 写入、付费 live eval、提交或推送。
- 当前只完成本地实现和自动化规范证据，Production 仍运行旧版本，未部署本批次修复。下一步先在本地人工验证中文生产原句与 Booking `699` draft Reject/Approve，再进入 quality review；不得把本节写成生产验收通过。

### 2026-09-27 — Copilot Reject 验收通过并完成 Production Recovery 技术设计

- 用户对 Booking `699` 的 pending 内部备注草稿执行 **Reject draft**；UI 显示 `Decision: rejected`。数据库复核审批状态为 `rejected`、已决策且未执行，审计事件严格为 `drafted → rejected`。
- Reject 后订单状态、空 `internalNote` 与订单行 MD5 `ace10326076edfe566905c37c7d53121` 均保持不变，证明拒绝链路没有订单副作用。
- 草稿内容错误地成为字面量 `[redacted]`。根因是请求边界先脱敏备注，模型再把脱敏占位符作为 `addBookingInternalNote.note` 写入审批；因此当前 Approve 验收被安全停止，不把错误数据写入订单。
- 技术设计选择“服务端绑定准确备注”：严格解析最新员工命令，模型消息和工具输入只含 bookingId 与 `[redacted]`，工具执行从服务端闭包取得准确原文；模型可见 tool output 再次脱敏，已认证 Staff UI 仍收到完整审批对象。trace 与审计不得记录备注正文。
- UI 选择受限 `react-markdown`：禁用原始 HTML，仅允许基础排版元素；审批与结构化经营结果优先，AI 解释、工具活动、反馈和 reference 分层折叠；重复 booking 空态合并并补齐窄屏响应式验证。
- 方案保存在 `docs/design/2026-09-27-copilot-production-recovery/`，尚待用户整体确认、提交与实施；没有修改产品代码、数据库或 Production deployment。

### 2026-09-27 — Staff Copilot 只读链路通过并发现生产 UX/中文缺陷

- `DEMO_STAFF` 首次发送自然中文经营问题“对比本月入住相关订单和收入，并列出需要关注的订单。”；Production 返回通用 bookingId 隐私说明，没有 KPI、卡片或工具轨迹。trace `e0e77de3-2c87-4c5f-a226-3325785e7948` 虽为 `completed`，但 `tool_names=[]`、`duration_ms=5610`、input/output tokens `1596/441`。
- 代码诊断确认不是模型中文能力、员工权限或数据库错误：隐私清洗器的 CJK 安全语法未包含“对比、入住相关、并列出、需要关注”等常用表达，因失败关闭把完整问题替换为 numeric bookingId fallback，模型从未看到原问题。
- 使用白名单内的受控中文“请查本月到店订单、收入统计和高风险订单。”单次重试成功。trace `7d0568d4-0cca-45d6-a961-dfa5f40bdb96` 为 `completed`、`error_code=null`、`duration_ms=9780`、input/output tokens `3904/1060`，依次调用 `getArrivals`、`getBookingMetrics`、`getBookingRisks`，tool errors `0`。
- 本月口径返回 0 到店、0 booking metrics/revenue 与 0 高风险订单；这与当前合成数据时间窗一致。Booking `699` 的 `internalNote`、订单行 MD5、审批数与审计数均保持基线，证明只读查询无业务写入。
- 用户截图发现 Production 抽屉可读性不足：模型 Markdown 作为普通段落原样显示，长正文缺少排版；模型摘要、工具轨迹与结构化空结果重复；48rem 窄抽屉信息密度过高。登记 F06-R5 为验收后必须修复，不把工具链通过误写成 UI 通过。

### 2026-09-27 — Staff Production admin-only Briefing 验收通过

- 用户以全新 `DEMO_ADMIN` 会话打开 Staff Production 的合成 Booking `699`；页面可读取订单，原始坚果过敏留言可见，生成前 `AI risk Briefing` 为 `missing`。
- 生成前数据库基线确认：订单状态为 `unconfirmed`、`internalNote` 为空、`booking_ai_insights` 为 0 条，订单行 MD5 校验值为 `ace10326076edfe566905c37c7d53121`。
- 单次 **Generate Briefing** 真实生成成功：`severity=high`、标签 `food-allergy`、2 条 action、confidence `0.98`。持久化 insight 为 `succeeded`、`attempt_count=1`、generation token 已清除、无 failure；模型 `gemini-3.6-flash`，prompt `booking-risk-v1`。
- 对应 trace `71ed8d8f-e4a5-4576-8649-e1cd55f458b1` 为 `completed`、`error_code=null`、`duration_ms=4984`、input/output tokens `130/695`、tool errors `0`。这是 Staff Production 真实模型与数据库证据，不是 fixture。
- 用户将结论保存为 `partially-correct`，纠正标签保留 `food-allergy`，并记录不含个人信息的人工处理说明；数据库复核 `reviewed_at` 与 `reviewer_feedback` 已持久化。
- 保存后 Booking `699` 仍为 `unconfirmed`、`internalNote` 为空，订单行 MD5 校验值保持不变，证明 Briefing 与人工复核没有修改订单业务字段。
- UI 没有显示瞬时成功 Toast，但页面立即出现 **Saved employee review** 持久化回显，刷新语义与数据库结果一致；登记为非阻塞 UX 观察，不误报为保存失败。未点击 Reanalyze、Check in 或 Delete booking。

### 2026-09-26 — 员工验收身份安全配置完成

- 用户在隔离 Demo Project 的 Supabase Auth Dashboard 创建并自行保管两个邮箱密码账号；本文仅使用 `DEMO_ADMIN` 与 `DEMO_STAFF` 代称，不记录邮箱或密码。
- 写入前以创建检查点进行只读核验：两个目标身份各恰好 1 个，均在检查点之后创建且已确认；同期新增用户总数恰好为 2，没有意外新增用户、既有授权角色或位于 `user_metadata` 的角色字段。
- 在单一事务与严格行数保护下，将 `DEMO_ADMIN` 的受信 `app_metadata.role` 设置为 `admin`，将 `DEMO_STAFF` 设置为 `staff`；任何前置条件或更新行数不符都会整体回滚。
- 写入后再次独立核验：两个身份的角色分别为 `admin`/`staff`，邮箱均已确认，授权字段均不在用户可修改的 `user_metadata`。没有读取、修改或记录密码。
- 新角色只会出现在新签发的会话声明中；后续验收必须退出旧会话并重新登录。尚未触发 Briefing、Copilot 草稿/审批、订单写入或 Cron。

### 2026-09-26 — 三段式人工验收启动：Guest 生产链路通过

- 按 Five-Minute Demo Script 开始验收，用户故事固定为 Guest UI → `/api/ai/concierge` → Gemini/Supabase 工具 → 推荐卡 → Adopt plan；员工端后续为 Supabase Auth 角色 → Briefing/Copilot → 人工审批。
- 官方 `agent-browser` 未安装，官方 Playwright CLI 又因本机 npm/TLS `ECONNRESET` 无法取得；使用仓库已锁定的 Playwright 库与系统 Chrome 的全新隔离 profile 执行公开 Guest 验收，没有读取日常 Chrome Cookie、密码或 Google 会话。首次点击发生在 hydration 前，调整为等待 network idle 后单次重试通过。
- 真实输入使用未来固定日期 `2026-10-10` 至 `2026-10-13`、4 人、总预算不超过 `$1,200` 与自然景观偏好。Production 首页返回 `200`，Concierge 展示 live availability，推荐 Cabin `003`（3 晚、4 人、`$900`）和其他候选；点击 **Adopt plan for 003** 后 URL 为 `/cabins/3#reservation`，页面出现 `AI plan applied. Review the dates before reserving.`。没有点击最终预订提交。
- 浏览器无 console error、page error；路由切换时旧 `?_rsc=` 请求出现一次 `ERR_ABORTED`，属于 Next.js navigation 取消旧请求，不登记为产品失败。截图保存在 ignored 本地证据 `output/playwright/feature06-production-guest.png`，SHA-256 `C814F4E933512544BC48EA3E6069143F27213461A8DA021C3983567380A60637`，画面不含账号或个人信息。
- 对应 Supabase trace `90f9b82c-4e8e-4721-903d-22dcaf8e846d` 为 `completed`、`error_code=null`、`duration_ms=11255`、`ttft_ms=7857`、input/output tokens `4719/1108`、tool `searchAvailableCabins`、tool errors `0`、model `gemini-3.6-flash`。本次是真实 Production 浏览器/模型/数据库工具证据，不是 fixture。
- 员工验收前只读统计 `auth.users` 的 `raw_app_meta_data.role`：仅 `none=1`，没有 `admin` 或 `staff`。候选合成订单已确认存在，例如 Booking `699` 含坚果过敏留言且 `internalNote` 为空；在创建最小权限演示身份前不触发 Briefing/Copilot 写入。
- 本批次未填写三次人工计时表：自动浏览器验证不等同于真人五分钟演练；未创建账号、未写入角色、未触发审批、未启用 Cron。

### 2026-09-26 — 现有 Vercel 项目部署通道复核

- 用户截图确认目标项目 `the-wild-oasis-website-ai` 的 Deployments 页面只显示现有 Production deployments，最新 `4jeguUq2E` 为旧 deployment 的 redeploy，并未包含本地可靠性修复；页面没有本地目录上传入口。
- 依据 Vercel 官方文档复核：Dashboard 的 Create Deployment 只接受已连接 Git 仓库的 branch/commit reference；Vercel Drop 每次创建新 Project。因此清洁上传目录不能直接覆盖当前 Project，继续使用 Drop 会产生第三个项目，不符合双端各一个项目的既定结构。
- 缓存 Vercel CLI `59.25.0` 通过既有依赖恢复启动，但临时配置未登录；直连登录返回 `fetch failed`，显式启用 Node 环境代理后通过 `127.0.0.1:7890` 仍返回 `ECONNRESET`，`curl` 对 `7890`/`7897` 的 Vercel API TLS 探测同样失败，未创建 deployment。
- Chrome 控制扩展因缺少 browser runtime 模块无法连接；Windows Computer Use 的安全规则禁止用 GUI 自动化终端，因此没有绕过浏览器或认证安全边界。
- Git 状态确认 Guest 当前 `origin=https://github.com/notjustkoala/the-wild-oasis-website-ai.git` 是 9 月 22 日新建的重开发仓库，旧 Guest 仓库为 `upstream=https://github.com/notjustkoala/the-wild-oasis-video.git`；Staff 同理，当前 `origin` 为新仓库，旧项目保留为 `upstream/the-wild-oasis`。后续允许发布当前 `origin/main`，不得 push 到 `upstream`。
- Guest 目标测试 16/16、TypeScript 与 `git diff --check` 再次通过；创建 commit `7376c1d fix: stabilize AI rate limiting across regions`。默认 `7890` 与单次 `7897` push 均失败，单次清空 Git 代理后直连成功发布到新仓库 `origin/main`；未修改全局代理配置。
- 用户在正确的 Project Settings → Git 页面把当前 Vercel Project 连接到 `notjustkoala/the-wild-oasis-website-ai`。连接前已存在的 `7376c1d` 没有补触发 deployment，因此创建并推送不改文件的 `e12be82 chore: trigger Vercel production deployment`；GitHub/Vercel status 随后从 pending 变为 success。
- 新 Production deployment ID 为 `EpThJRTzSjS2qdMvfGCKPGEJ2Jfx`，GitHub deployment environment 明确为 `Production`，正式 alias [`https://the-wild-oasis-website-ai.vercel.app`](https://the-wild-oasis-website-ai.vercel.app) 返回 `HTTP 200`。独立 deployment URL 受 Vercel Authentication 保护，不把其登录重定向误记为应用失败。
- 仓库 `npm run smoke:production` 仍因本机 Node `fetch failed` 未通过，保留为本地网络链路限制；`curl --noproxy` 对正式 alias 返回 `HTTP 200`，且真实 `POST /api/ai/concierge` 返回 `200 text/event-stream`。
- 真实政策查询不含个人信息，响应 `X-Vercel-Id` 为 `sfo1::sin1::…`，证明访问入口与 Function 执行区分离且 Function 已迁至新加坡。trace `78556273-8120-4715-9046-d2aec4a405f9` 在 Supabase `ai_runs` 中为 `completed`、`error_code=null`、`duration_ms=8030`、`ttft_ms=7982`、input/output tokens `2686/333`、tool `searchHotelPolicies`、tool errors `0`、model `gemini-3.6-flash`。
- 本节将 Guest 跨区域限流修复登记为生产通过；回答内容因当前政策语料未命中而安全返回 `insufficient-evidence`，这不属于 rate-limit/store 故障。

### 2026-09-25 — 生产 Gemini 配置验证与跨区域限流超时修复

- 用户在 Guest Vercel Production 配置 `GOOGLE_GENERATIVE_AI_API_KEY` 并重新部署。真实 `/api/ai/concierge` 请求不再返回 configuration 错误，证明变量进入 runtime。
- 首个真实请求 `3a3943bc-30df-4dba-ab4a-c66b46b0b19e` 返回 `503`；Supabase `ai_runs` 记录为 `store-unavailable`、`duration_ms=1515`、无模型 token/tool，证明失败发生在模型调用前的限流存储截止时间。
- 同一批次后续真实请求 `c08e6a9f-8676-4b27-8ed9-469e4c7142cc` 状态为 `completed`，模型 `gemini-3.6-flash`，输入/输出 token 为 `2679/470`，调用 `searchHotelPolicies`；因此 Google key、模型权限、Supabase secret 与 RPC 权限均已实际验证。
- Vercel 请求日志显示 Function 执行于美国 `iad1`，Supabase Demo Project 位于新加坡 `ap-southeast-1`；Supabase edge log 中 `consume_ai_rate_limit` 为 `200`、`ai_runs` insert 为 `201`，排除 401/403。根因为跨区域冷请求偶发超过原 1.5/1.6 秒 fail-closed 窗口。
- Guest 本地修复：`vercel.json` 设置 Functions 主区域 `sin1`；限流 RPC/guard 截止时间调整为 `4500/5000 ms`，继续保持存储不可用时失败关闭。针对性 16 tests、TypeScript、JSON 区域检查与完整 `npm run check`（41 files / 530 tests / production build）通过。
- 自动部署未执行：缓存 CLI 缺少 `execa`，在工作区临时安装锁定 `vercel@59.25.0` 又连续约 90 秒无输出，已终止且未创建 deployment。生成清洁上传目录 `D:/working/code/vercel-upload-guest-20260925` 与压缩包 `D:/working/code/vercel-upload-guest-20260925.zip`（137 files，SHA-256 `39EFE53160AC6B277225E2060F1C771BC3CEAC3CBC6F4D485E934D4CA4203FDF`）；扫描确认不含 `.env*`、`.git`、`.vercel`、`node_modules`、`.next`、tests 或 Supabase 文件。
- 本节不把本地修复写成生产通过；仍需重新部署后确认 production Function 路由到 `sin1`，并完成一次无 `store-unavailable` 的真实 AI 响应。

### 2026-09-24 — Staff 部署平台统一为 Vercel

- 用户确认不再使用 Netlify，将 Guest/BFF 与 Staff/Admin 统一为同一 Vercel 账户下的两个独立 Project；此前 Netlify 登录尝试没有创建站点或修改远端资源。
- Staff 删除 `netlify.toml`，新增 `vercel.json`：保留 Vite `dist` 构建输出、React Router SPA 回退和既有四项安全响应头；`.gitignore` 新增 `/.vercel/`。
- 迁移后 Staff 完整 `npm run check` 通过：lint、typecheck、8 个测试文件/70 个测试、Vite production build；`docs:check`、`git diff --check` 和 `vercel.json` JSON 解析同时通过。
- Vercel CLI 使用临时配置目录以避免污染仓库或泄露 token，但设备登录经代理仍遇到 TLS reset；因此切换到用户已登录的可见 Chrome。本地提交 `6cb374e` 已创建，GitHub push 同样暂被连接重置阻塞。该条记录的是部署前状态，最终部署结果见下一节。

### 2026-09-24 — 双端 Vercel production 部署与 exact-origin 联通

- 从 Staff clean commit `6cb374e` 生成不含 `.git`、`node_modules`、`.env.local` 或 secret 的上传目录，经 Vercel Drop 创建 Hobby Project `the-wild-oasis-ai`；正式 alias 为 [`https://the-wild-oasis-ai.vercel.app`](https://the-wild-oasis-ai.vercel.app)。写入 Production-only 的 `VITE_SUPABASE_URL`、现代 `VITE_SUPABASE_PUBLISHABLE_KEY` 和 `VITE_AI_BFF_URL` 后重新部署，Dashboard reference `AeeYdi6ZAB1AJoKaGYLKQUmSEfnF` 状态为 `Ready`。没有启用 Pro trial 或付费功能。
- Staff 使用与 Guest 相同的低权限 `sb_publishable_...`；未把 `sb_secret_...`/service-role、模型 key 或密码写入前端。依据当日 Supabase 官方 API-key 文档复核：浏览器使用 publishable key，访问范围继续由 RLS 决定。
- 浏览器生产验证：`/` 返回 `200` 并渲染 Staff 登录页；直接访问 `/dashboard` 被应用鉴权正确重定向到 `/login`，证明 SPA rewrite 生效；发布 bundle 确认包含三项公开配置；`X-Content-Type-Options=nosniff`、`Referrer-Policy=strict-origin-when-cross-origin`、`Permissions-Policy=camera=(), microphone=(), geolocation=()`、`X-Frame-Options=DENY` 均已生效。
- Staff 仓库 `npm run smoke:production` 对真实 URL 发起请求时因本机终端 TLS 链路返回 `fetch failed`，未伪造为脚本通过；同一站点已由浏览器同源 HEAD 验证为 `HTTP 200`。这与此前 GitHub push/Vercel CLI 的连接重置一致。
- Guest Production 新增 Config `AI_ADMIN_ORIGIN=https://the-wild-oasis-ai.vercel.app` 并重新部署；Dashboard reference `FymQ9dzrjnkxp6Dnaikq1DXSRVA3` 状态为 `Ready`，正式 alias 不变。从真实 Staff origin 对 Guest `/api/ai/admin` 发起 CORS `OPTIONS` 预检返回 `204`，Guest 首页重新部署后正常渲染。
- 仍未配置 `GOOGLE_GENERATIVE_AI_API_KEY`，因此本节只证明双端部署、公开数据配置、SPA/security headers 与 exact-origin CORS，不把真实 AI 生成、员工授权、审批写入或 Cron 启用登记为通过。

### 2026-09-22 — Feature06 恢复与基线

- 用户连续要求从中断处继续；Controller 指定从已验收 Feature05 转入 Feature06。
- 核对后台 HEAD `b934a20`、网站 HEAD `b37a5ca`，两仓库都含 Feature05 未提交改动；未进行清理、提交或远端操作。
- 建立本进度文件，先把缺失的真实部署、人类验证和录屏列为阻塞，防止后续把本地材料冒充上线证据。

### 2026-09-22 — 作品集核心文档首批

- 新增 `docs/portfolio/CASE_STUDY.md`：统一 Guest/Staff/Engineering 叙事、双端架构、工程取舍、证据分层、5 分钟路径与限制。
- 新增 `AI_EVAL_REPORT.md` 与 `RESUME_BULLETS.md`：逐项链接既有 offline/live 报告；明确离线 100% 不是模型准确率、真实模型首批 8/10、后续分批通过、成本 unknown。
- 新增 `DEMO_SCRIPT.md`：5 分钟三段式演示、越权失败、2–3 分钟录屏 shot list、三次真人计时和陌生读者验证空表；实际录屏与人工结果保持待执行。
- 新增 `DEPLOYMENT_RUNBOOK.md`：双端部署顺序、环境变量信任边界、最小权限演示角色、生产 smoke 合约和演示数据恢复决策。
- 数据恢复选择 fail-closed：当前 schema 无可靠 demo provenance，因此没有新增危险全表 reset endpoint 或 Cron；文档列出启用自动恢复前的事务、锁、权限和测试前置。
- 新增可版本化 `docs/portfolio/assets/architecture.svg`；尚未运行链接检查或渲染检查。

### 2026-09-22 — 双端入口、部署配置与本地验证工具

- 重构两端 `README.md` 顶层叙事：业务问题、双端链接/架构、工程取舍、5 分钟演示、测试命令、演示角色、限制与未来工作齐全；保留原 Feature01–05 有价值技术说明。
- 后台 `netlify.toml` 增加明确 build/publish 与基础安全响应头；网站新增 `vercel.json` 基础安全响应头。没有添加 Cron，因为当前无法安全区分 demo 行。
- 两端 `.env.example` 增加生产部署/客户端秘密边界；没有加入凭据或真实账号。
- 两端新增无第三方依赖的 `docs:check` 与显式 opt-in `smoke:production`。后台链接检查 `91` 个本地链接/`26` 个 Markdown 通过；网站 `15` 个本地链接/`21` 个 Markdown 通过。
- Smoke 安全负例已运行：两端在 URL 缺失时均非零退出；传入 `https://staff.example` / `https://guest.example` 时均拒绝 placeholder。没有真实 URL，因此未发出生产请求，也未登记 smoke 通过。
- 调整两端 `.gitignore`，仅解除 `output/playwright/feature05-*.png` 的忽略；`test-results` 与其他 output 继续忽略。Git 状态确认两端 fixture PNG 现在是可版本化未跟踪资产，文档明确这些不是模型/数据库/生产证据。
- F06-01、F06-02 本地可实施范围和 F06-04 完成；F06-03 只剩必须由人/部署环境完成的录屏、三次计时和陌生读者验证。

### 2026-09-22 — 完整检查与本地收尾

- 后台 `npm run check` exit 0：lint、typecheck、8 个测试文件/70 个测试、Vite production build 全部完成。
- 网站 `npm run check` exit 0：lint、typecheck、38 个测试文件/507 个测试、Next production build 全部完成。保留 4 个既有 `<img>` lint warning；webpack cache 在 Windows sandbox 出现 rename `EPERM` warning，但编译、静态页生成和最终命令均成功。
- 最终重跑 Markdown link check：后台 28 个 Markdown/103 个本地链接通过；网站 21 个 Markdown/15 个本地链接通过。
- `git diff --check` 两仓库 exit 0；`vercel.json` JSON parse 和 `architecture.svg` XML parse 通过。对新 README/portfolio 文档的 credential/email-like 模式扫描无匹配。
- 新增 `assets/screenshots/README.md`：8 张 fixture PNG 的来源、状态、SHA-256 和证据限制；新增 `assets/video/README.md` 明确真实视频不存在及录制后登记要求。
- 人工查看 8 张 PNG，画面仅含固定日期、合成 trace 和受控 UI 文本，未见账号凭据或个人信息。Guest timeout/denied 当前视觉相同且哈希相同，manifest 明确 HTTP 语义来自测试断言而非像素。
- `git status --short --untracked-files=all -- output` 逐仓核对：两端各且仅暴露 4 张 `feature05-{success,empty,timeout,denied}.png`；其他 output 与 `test-results` 仍被忽略。网站 `.gitignore` 的重复 `ai-prices.local.json` 项已清理。
- 没有运行 `eval:ai:live`、远端 migration/reset、真实生产 smoke、提交、推送或发布。

## 尚未完成的外部/人类验收

1. 双端真实 HTTPS URL 和 exact-origin 已核验；仍需配置模型 key、创建/核验最小权限 Staff 演示账号，并按 Demo Script 完成真实 AI 与审批链人工验收。
2. 隔离 Demo Project migration、seed 与 rollback-only SQL 已通过；仍需按 Runbook 临时开启 reset flag，完成一次受保护手动调用和非 demo 行复核后，再决定是否保持 Cron 激活。
3. 按 shot list 录制并隐私复核 2–3 分钟视频，登记公开链接、日期和 SHA-256。
4. 实际完成三次不超过 5 分钟的计时演练并填写结果。
5. 请一名不了解项目的人阅读/操作并记录其对闭环、AI 边界、安全和前端难点的复述。

### 2026-09-22 — 规范审查返工开始

- 规范审查结论为不通过：Briefing 实际只允许 admin，但 Runbook 仅定义 DEMO_STAFF；原定时恢复只有 fail-closed 文档，没有本地实现；跨 sibling 相对链接不适用于两个独立 GitHub origin。
- 返工边界：新增专用 `DEMO_ADMIN`，不扩大生产权限；实现默认关闭且 service-only 的每日 reset 链，不执行远端 migration/reset；跨仓库链接固定到两个 origin 的 `codex/ai-hospitality-platform` 分支，并注明发布前需 push 后验证。
- 已读取 Supabase skill 并核对 2026 breaking change、官方 Database Functions/RLS 文档：新 public 对象显式 grants，函数默认执行权限必须 revoke，优先 security invoker；Vercel 官方文档确认 `CRON_SECRET` Bearer、重复/重叠投递要求锁与幂等、Hobby 每日一次限制。

### 2026-09-22 — 安全 reset 迁移与 seed 首批

- 使用仓库锁定 Supabase CLI `2.117.0` 的 `npx supabase migration new add_safe_demo_reset` 创建 `20260922064008_add_safe_demo_reset.sql`；首次 sandbox 执行因 CLI 需要写用户级 telemetry 文件而 EPERM，获准后成功。未连接远端。
- 迁移为 `public.bookings` 增加仅允许 null/固定值的 `demo_dataset_id`，并将 authenticated INSERT/UPDATE 改为排除 provenance 列的列级 grants，避免客户端伪造；service role grants 显式保留。
- 新增启用/强制 RLS 的 `private.demo_booking_baseline`，客户端无 schema/table 权限，service role 只有 SELECT；seed 由数据库 owner 在同一事务填充。
- 新增无参数 `public.reset_demo_bookings()`：`security invoker`、空 `search_path`、PUBLIC/anon/authenticated revoke、仅 service_role execute；固定 dataset、事务级 `pg_try_advisory_xact_lock`、仅删除 demo 行、级联清理其 Briefing/审批状态、显式字段恢复、序列校正、受控 busy/reset count。
- generator 加入固定 `wild-oasis-demo-20260803-v1` provenance 和 baseline 前后置条件，继续拒绝全部 remote flags；已用本地生成命令更新 `supabase/seed.sql`（800 行，checksum 保持 `3272ef...61ef`）。
- 新增 generator provenance 测试、迁移静态安全测试和 rollback-only `supabase/tests/demo_reset.sql`；SQL 套件覆盖最小权限、固定约束、成功/重复、非 demo 保留、cascade 清理和冲突导致的原子回滚。尚未运行测试，本机 PostgreSQL 可用性待核对。
- 下一批：实现默认关闭的 Cron Route、route 单测与 Vercel daily 配置，然后运行首轮针对性验证。

### 2026-09-22 — 迁移去重、Cron Route 与首轮测试

- Controller 发现 CLI 空文件在首次大 patch 后被重复追加整段迁移，第二段还残留 `pg_catalog.greatest/coalesce`。已立即用 `apply_patch` 去除第二段，只保留 1 份 168 行迁移；`add column demo_dataset_id`、`create table private.demo_booking_baseline`、service grant 各仅出现一次，且保留合法 `greatest(coalesce(...))`。
- 迁移合约测试新增出现次数断言，防止重复 DDL 回归。
- 新增 `GET /api/cron/demo-reset`：`DEMO_RESET_ENABLED` 默认非 true 时 503；`CRON_SECRET` 要求 32–256 字符且无首尾空白，使用 timing-safe Bearer 比较；仅通过 server-only privileged client 调用固定无参数 RPC；success/busy/failure 返回受控 JSON 且 `no-store`，不回显数据库错误。
- `vercel.json` 新增每日 `0 3 * * *` Cron，路径与 Route 一致，兼容 Hobby 每日一次限制；配置存在不等于已部署/激活。
- `.env.example` 新增 server-only flag/secret 启用前置，默认 `DEMO_RESET_ENABLED=false`，没有真实 secret。
- 针对性 Vitest：`generate-demo-data` 7、migration contract 4、Cron route 15，共 3 files/26 tests 全部通过，exit 0。SQL 套件尚未实跑。

### 2026-09-22 — 演示角色与跨仓库链接返工

- 两端 README、Case Study、Demo Script、Deployment Runbook 已新增 `DEMO_ADMIN`：仅用既有 `app_metadata.role=admin` 演示 admin-only Risk Briefing；`DEMO_STAFF` 保持 staff，用于 Copilot 只读/审批；未修改 `booking-insight-auth.ts` 或扩大生产权限。
- Demo Script 要求预先打开两个独立 profile/tab 并在第二/三段明确切换，避免为了 5 分钟演示混淆角色边界。
- Runbook 已改为本地 reset 链现状与完整启用顺序：migration → 固定 seed/private baseline → rollback-only SQL → flag 仍 false 部署 → 手动验证 → true 重部署 → production Cron 日志；紧急停用为 flag false + 平台禁用。
- 两端 README/Case Study/AI Eval/Runbook、Feature05 进度/closeout/manual acceptance、截图 manifest 与网站 `content/README.md` 的跨 sibling 公开链接，已改为两个独立 GitHub origin 上固定 `codex/ai-hospitality-platform` 分支绝对 URL；仓库内链接继续相对。AGENTS 的本地接续链接刻意保留 sibling 相对路径。
- 文档明确这些 Feature06 变更尚未 push，绝对 URL 是预期发布位置，push 后必须逐项实点验证；没有宣称当前可访问。
- 本机 Supabase status 显示没有 Docker/Podman，故 rollback-only `supabase/tests/demo_reset.sql` 本轮未运行，不继续排查环境；保留为部署前强制步骤。

### 2026-09-22 — 返工完整验证与等待复审

- 网站首轮完整 `npm run check` 在 TypeScript 阶段发现 Cron route 测试对 `vi.stubEnv` 传入 `undefined`；改为变量缺失时显式删除环境变量后重跑。该失败未被隐藏。
- 网站最终 `npm run check` exit 0：lint、typecheck、40 个测试文件/527 个测试、Next production build 全部完成。保留 4 个既有 `<img>` lint warning；Windows webpack cache 出现 rename `EPERM` warning，但编译、14 个静态页生成和最终命令均成功。
- 后台 `npm run check` exit 0：lint、typecheck、8 个测试文件/70 个测试、Vite production build 全部完成；本轮后台只涉及文档/部署说明，没有扩大应用权限。
- 本轮针对性 Vitest 已包含在网站全量结果中：generator 7、migration contract 4、Cron route 15，共 26 个测试通过。迁移合约确认 `add column demo_dataset_id` 与 `create table private.demo_booking_baseline` 各只出现一次，且没有无效的 `pg_catalog.greatest/coalesce` 限定。
- `vercel.json` 可解析，Cron 仅 1 项、路径 `/api/cron/demo-reset`、计划 `0 3 * * *`；每日一次符合 Hobby 下限，Route 默认关闭并校验强 `CRON_SECRET` Bearer。
- rollback-only SQL 套件未运行：本机没有 Docker/Podman，因而没有可用本地 Supabase/PostgreSQL。此项保持部署前阻塞，未改称通过，也未对远端数据库执行任何操作。
- 最终 Markdown link check：后台 28 个 Markdown/72 个本地链接通过；网站 21 个 Markdown/7 个本地链接通过。跨仓库公开链接已固定到各自 GitHub origin/分支，但 Feature06 尚未 push，因此仍需发布后点击验证；Case Study 中的两个 sibling 路径只用于本地 `cd` 命令，并非公开链接。
- 两仓库 `git diff --check` exit 0；`git status --short --untracked-files=all -- output` 仍只暴露每仓 4 张指定 Feature05 fixture PNG，没有 `test-results` 或其他 output。
- 三项规范返工现进入等待复审；未提交、未推送、未发布、未执行真实生产 smoke 或付费 live eval。

### 2026-09-22 — 替代规范复审：sequence 权限与迁移顺序

- 替代规范复审未通过：`security invoker` reset RPC 调用 `setval`，但 service role 原来只有 sequence `USAGE, SELECT`；同时 `supabase/README.md` 引用了不存在的 bootstrap 文件，并可能让初始化跳过中间 migration。
- 按 PostgreSQL sequence 权限契约，仅为 `service_role` 补充 `public.bookings_id_seq` 的 `UPDATE`；没有给 PUBLIC、anon 或 authenticated 扩权。rollback-only SQL 增加 `has_sequence_privilege(..., 'UPDATE')` 正向断言，migration contract 同时检查精确 grant 与无客户端 UPDATE grant。
- `supabase/README.md` 改为按升序应用 `migrations/` 中全部版本化 SQL：从实际存在的 `20260806143548_dev_database_bootstrap.sql` 开始，Feature06 reset 必须晚于所有先前 migration，再执行 base seed、图片与 demo seed。
- 全局检查发现两端 README 还引用了不存在的 Feature03 migration `20260825000100...`，已改为实际的 `20260824163705_optimize_ai_operations_advisors.sql`；Feature05 进度中的旧 observability 文件名也同步到实际版本化文件。Deployment Runbook 原本已要求按文件名顺序应用全部 migration，无需改变该安全边界。
- 针对性 Vitest exit 0：generator 7、migration contract 4、Cron route 15，共 3 files/26 tests 通过。
- 网站完整 `npm run check` exit 0：lint、typecheck、40 files/527 tests 与 Next production build 全部通过；仅保留 4 个既有 `<img>` warning 和 Windows webpack cache rename `EPERM` warning，编译与 14 个静态页生成成功。
- 最终 Markdown link check：后台 28 files/72 local links、网站 21 files/7 local links通过；两仓库 `git diff --check` exit 0。全局 Markdown 扫描已无三个错误旧 migration 文件名的有效引用（本日志对旧名的历史说明除外）。
- migration 静态核对确认 sequence grant 精确为 `usage, select, update ... to service_role`；migration contract 的负向断言禁止 PUBLIC/anon/authenticated 获得该 sequence UPDATE。
- 数据库 SQL 套件仍因本机没有 Docker/Podman 而未实跑，不会把静态/TS 结果冒充数据库执行证据；未对远端数据库执行 apply/reset。
- 该修复批次完成时进入再次规范复审；未提交、未推送、未发布、未执行生产 smoke 或付费 live eval。最终规范结论见下一节。

### 2026-09-22 — 替代规范复审通过，进入人类验证

- 替代规范 reviewer 对 F06-R4 最终给出 ✅ PASS；规范审查阶段完成。质量审查尚未启动，也没有质量 reviewer 结论。
- 当前转入人类验证，需由用户或具备相应权限的人完成/确认：
  1. 发布 Guest/Staff 到真实 HTTPS 域名，并运行双端 production smoke。
  2. 在隔离 Demo Project 按顺序执行全部 migration、base/demo seed 与 rollback-only `supabase/tests/demo_reset.sql`，再验证默认关闭、手动启用、重复/重叠投递和紧急关闭的 Cron 全链路。
  3. 按 shot list 录制并隐私复核 2–3 分钟备用视频，登记日期、链接和 SHA-256。
  4. 按 `DEMO_SCRIPT.md` 完成三次不超过 5 分钟的计时演练并记录结果。
  5. 请一名不了解项目的人阅读 README、运行演示并复述业务闭环、AI 边界、安全措施与前端难点。
- 如果用户本轮只能验收本地文档、脚本和现有自动化检查，可以记录该局部验收结果，但不能把它等同于上述部署/数据库/真人证据；整体 Feature06 仍不正式关闭，也不能标记质量审查通过。
- 本次仅同步状态，没有修改功能代码、测试、迁移或部署配置；仍未提交、推送、发布或写入远端 Supabase。

### 2026-09-22 — 人工部署操作准备

- 已按实际代码复核身份边界：Guest 使用 Auth.js Google OAuth，生产 callback 为 `https://<guest-host>/api/auth/callback/google`；Staff 使用 Supabase Auth 邮箱密码账号，并从受信 `app_metadata.role` 区分 `admin`、`staff` 与无权账号。部署 Runbook 已纠正原先把 `DEMO_GUEST` 写成 Supabase Auth 密码账号的不准确说明。
- 人工部署顺序保持安全失败关闭：先在隔离 Demo Project 完成全部 migration、base seed、图片、demo seed 与 rollback-only SQL，同时保持 `DEMO_RESET_ENABLED=false`；再依次部署 Guest、Staff，回填双方 exact origin 后重新部署 Guest。Cron route 先验证关闭态 503，再临时开启并重新部署完成一次受保护手动调用；验证成功后才保持开启并启用计划任务，失败则立即回退为关闭态。
- 当前仍未执行远端 migration、seed、平台部署、Cron 激活或人工验收；这些项目必须由实际执行结果更新，不能以本地检查代替。

### 2026-09-22 — 人工部署执行：本地发布准备完成，远端通道阻塞

- Staff 完整 `npm run check` 通过：8 files/70 tests、typecheck、Vite production build；`docs:check` 通过 28 files/72 links。创建提交 `3c6e05f feat: complete AI evaluation and demo delivery`。
- Guest/BFF 完整 `npm run check` 通过：40 files/527 tests、typecheck、Next production build；`docs:check` 通过 21 files/7 links。保留 4 个既有 `<img>` warning 和 Windows webpack cache EPERM warning，实际编译与 14 页生成成功。创建提交 `f81d2eb feat: complete AI evaluation and safe demo reset`。
- 两仓库 `.env.local`/`.env.development.local` 均保持 ignored；提交前按高风险 key 前缀扫描，只有 `.env.example`/README 占位说明命中，没有真实 secret 被暂存。
- 两仓库 HTTPS `git push` 在沙箱内一次、授权网络下两次均被 connection reset；GitHub connector 可读到目标分支和基线提交，但创建 blob 返回 `403 Resource not accessible by integration`；SSH 22 端口被 reset，官方 SSH-over-443 通道被关闭。没有远端 branch 更新。
- 用户指定的 Windows Computer Use runtime 返回 unavailable；按技能回退连接 Chrome 时，浏览器客户端因 `node:process` 导入被运行时拒绝，未控制任何网页、未读取浏览器会话或凭据。
- Supabase 只发现组织 `notjustkoala's Org`（ID 不在本文记录）和四个现有项目；其中没有隔离 Demo Project，且明确不复用 `wild-oasis-dev`。创建新项目前仍需用户选择组织、区域并确认实际费用。Vercel 连接正常但当前 team 下无项目；尚未部署。Netlify 尚未连接。
- 本批次没有创建 Supabase/Vercel/Netlify 项目，没有执行远端 SQL、上传图片、设置环境变量、创建账号或激活 Cron。

### 2026-09-22 — GitHub 新仓库首次发布完成

- 用户确认旧仓库仅作为历史上游，不接收本轮重开发版本；创建两个公开空仓库：Staff `notjustkoala/the-wild-oasis-ai`、Guest/BFF `notjustkoala/the-wild-oasis-website-ai`。
- 两个本地仓库均将旧 `origin` 改名保留为 `upstream`，并把对应新仓库设置为 `origin`；没有向旧仓库写入任何 Feature06 提交。
- Staff 当前本地分支保持 `codex/ai-hospitality-platform`，首次发布到新仓库远端 `main`；远端核验为 `f80c2ac838486d5bdb1cbb13a247accfc359b555`。
- Guest/BFF 当前本地分支保持 `codex/ai-hospitality-platform`，首次发布到新仓库远端 `main`；远端核验为 `f81d2eb2444684807f6e8178b8d61d030a21c147`。
- GitHub 默认代理 `127.0.0.1:7890` 仍会 reset；仅对发布命令临时使用 `127.0.0.1:7897`、HTTP/1.1 与 Git OpenSSL 完成连通核验，没有修改用户全局 Git 或系统代理设置。
- Windows Computer Use 已能定位 Chrome/GitHub 窗口，但因无法以足够置信度验证当前浏览器 URL，被运行时安全机制终止；仓库由用户手动创建，代码通过 Git 发布，未自动操作登录、密码、验证码或浏览器安全设置。
- 本步骤只完成源码首次发布，尚未创建隔离 Supabase Demo Project，也未执行远端 migration/seed、Vercel/Netlify 部署、生产 smoke、演示账号、Cron 激活或人工录屏验收。

### 2026-09-22 — 隔离 Supabase Demo Project 创建完成

- 用户确认在 `notjustkoala's Org` 创建 `wild-oasis-demo`，区域 `ap-southeast-1`；Supabase 返回项目费用为每月 `0 USD`，用户在创建前明确确认费用。
- 新项目 ref 为 `fadfglcobmxxsawxlmpb`；创建后独立读取项目状态为 `ACTIVE_HEALTHY`，数据库为 PostgreSQL `17.6.1.166`（engine 17，GA）。
- 该项目仅用于 Feature06 演示与人工验收，未复用现有 `wild-oasis-dev` 或其他项目。
- 本步骤只完成隔离项目创建；尚未执行 migration、base/demo seed、图片上传、rollback-only SQL、Auth 演示账号创建、环境变量配置或 Cron 激活，也未读取、记录或展示任何 secret key。
- 2026 新项目默认可能不再自动向 Data API 暴露新表；后续必须按已版本化 migration 的显式 grants 与 RLS 合约执行并验证，不能依赖旧的默认权限行为。

### 2026-09-23 — 远端 migration、seed、Storage 与 reset SQL 验证

- 在隔离项目 `fadfglcobmxxsawxlmpb` 按源文件名顺序应用 10 条既有 migration；远端迁移名保留源时间戳前缀。bootstrap 后核验 4 张核心表均启用 RLS，`cabin-images` bucket 存在且公开读取，显式 grants 符合 migration。
- Security advisor 没有 error；两个无 policy 的 RLS 表为刻意的 service-only deny-by-default，两个 authenticated `SECURITY DEFINER` RPC 为已审查受控例外。Performance advisor 有 2 个 RLS initplan warning 和新库 19 个 unused-index INFO，记录但不冒充已修复。
- 使用项目专用公开 Storage URL 渲染 ignored base seed，生成器验证为 8 cabins、1 settings、30 guests/30 唯一邮箱；远端写入后再次精确核验，bookings/baseline 当时均为 0。
- Supabase CLI 通过单次 `127.0.0.1:7897` 代理访问指定 `--project-ref`；递归上传最初落入 `cabins/` 子目录，随即用官方 Storage `mv` 将 8 张 JPG 逐一移动到 bucket 根目录。最终元数据仅含 `cabin-001.jpg` 至 `cabin-008.jpg`，大小与本地一致且 MIME 均为 `image/jpeg`。
- 应用固定 `supabase/seed.sql` 后核验 800 demo bookings、800 private baseline、0 非 demo 行，双向集合差均为 0；8 个 cabin URL 均精确指向新项目根目录图片。reset RPC 对 PUBLIC/anon/authenticated 均不可执行，仅 service_role 可执行。
- 首次运行 rollback-only `supabase/tests/demo_reset.sql` 失败并自动回滚：2026 新项目显式权限下，`service_role` 缺少读取 `booking_ai_insights` 的权限，测试无法确认 cascade 清理。
- 使用 CLI 创建 `20260922160617_grant_service_role_ai_insight_read.sql`，只向 service_role 授予该表 SELECT；新增迁移合约测试禁止客户端或写权限扩大。2 files/9 tests 通过后应用第 11 条远端 migration。
- 第二次 rollback-only SQL 完整通过：客户端拒绝、固定 provenance、成功/重复 reset、非 demo 保留、AI insight cascade 与冲突失败原子回滚均满足断言。事务回滚后再次核验 bookings/baseline 为 800/800，非 demo 与 AI insight 临时行均为 0。
- 修复后 Guest/BFF 完整 `npm run check` 通过：lint、typecheck、40 files/528 tests 与 Next production build 全部成功；保留 4 个既有 `<img>` warning 和 Windows webpack cache `EPERM` warning。Guest `docs:check` 为 21 files/7 links，Staff 为 28 files/72 links，双端 `git diff --check` 均通过。
- 所有有效跨仓库 Markdown URL 已从旧仓库/功能分支切换到新仓库 `the-wild-oasis-ai` 与 `the-wild-oasis-website-ai` 的 `main`；历史日志中的纯文本分支名仍保留为当时事实。
- 本阶段没有创建 Auth 演示账号、读取或记录 secret key、部署 Vercel/Netlify、启用 reset flag/Cron 或执行生产 smoke。

### 2026-09-23 — Guest/BFF 首次 Vercel production 部署与 smoke

- 在个人 Vercel scope 创建并链接项目 `the-wild-oasis-website-ai`；CLI deployment `dpl_6sNN9bC2UV3q6mRjc57qVJ8oLE1z` 状态为 `READY`，production alias 为 [`https://the-wild-oasis-website-ai.vercel.app`](https://the-wild-oasis-website-ai.vercel.app)，构建对应 Guest 提交 `87149f1`。
- Vercel 已为 Production/Preview/Development 配置新 Demo Project 的 `SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`，以及 `AUTH_TRUST_HOST=true`、`AI_PROVIDER=google`、`DEMO_RESET_ENABLED=false`；另在平台内生成并保存 `NEXTAUTH_SECRET`、`AI_OBSERVABILITY_SECRET`、`CRON_SECRET`。本文不记录任何值。
- 用户已明确同意把项目 `fadfglcobmxxsawxlmpb` 的默认 `sb_secret_...` 服务端密钥传输到该 Vercel 项目的 Production/Preview/Development。CLI 在内存中选择 `name=default,type=secret` 的现代 key，经标准输入写为 Hidden/Secret `SUPABASE_SECRET_KEY`，并确认覆盖三个环境；没有从旧本地项目复制 secret，也没有把完整密钥输出到聊天、日志或文件。
- `AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`、`GOOGLE_GENERATIVE_AI_API_KEY` 与 `AI_ADMIN_ORIGIN` 尚未完成生产配置；前两项需要确认生产 callback，模型 key 当前没有可用来源，Staff origin 要等 Staff 发布。因此当前部署不能作为登录、AI 或双端审批闭环通过证据。
- 生产 HTTP 验证：首页、`/cabins`、`/api/auth/providers` 均为 `200`；provider JSON 返回 Google signin/callback，精确 callback 为 `https://the-wild-oasis-website-ai.vercel.app/api/auth/callback/google`。`/api/cron/demo-reset` 无凭据 GET 返回预期 `503`，证明默认关闭开关生效且未触发 reset。
- Vercel 最近 30 分钟 production runtime logs 与上述请求一致，无 error/warning；首页、cabins、providers 为 `200`，Cron route 为预期 `503`。
- 仓库 `npm run smoke:production` 首次受本机故障代理影响返回 `fetch failed`；仅对重跑进程清空代理变量后，同一脚本以真实 production URL 通过并确认 app marker 与 `HTTP 200`。这次通过计为 Guest production smoke，首次失败保留为网络诊断事实。
- 新增 `.vercelignore` 排除本地 secrets、依赖、构建缓存、测试证据、Supabase SQL 与仓库文档，Vercel link 还在 `.gitignore` 增加 `.env*`；两项仍待提交。首次 deployment 的 source metadata 标记 `gitDirty=1`，因为这两个部署忽略规则当时尚未提交，不把该部署冒充 clean-tree 构建。
- Vercel GitHub integration 因账号尚无 GitHub Login Connection 而无法建立，当前部署由已授权 CLI 完成；自动 Git 部署待用户以后连接账号，不阻塞本轮 CLI 验收。
- Guest 部署忽略规则提交为 `a8553dd chore: harden Vercel deployment inputs`，Staff 部署记录提交为 `50a4694 docs: record Guest production deployment`；两者均已推送到各自新仓库的 `main`。
- 写入 secret 后，从 clean Guest HEAD `a8553dd` 创建 production deployment `dpl_DULFfM2CFR5Q2vbBiauf7MHs2Re1`，状态 `READY`，正式 alias 继续为 [`https://the-wild-oasis-website-ai.vercel.app`](https://the-wild-oasis-website-ai.vercel.app)。`.vercelignore` 将上传缩减到约 `125.5 KB`；Next build、lint、typecheck 与 14 个页面生成成功，仅保留 4 个既有 `<img>` 性能 warning。
- 新 deployment 复测：仓库 production smoke 在显式 `NO_PROXY=*` 后通过并确认 `HTTP 200`；只读 `/api/cabins/1` 返回 `200`，证明 production alias 到新 Demo Project 的公开数据链路可用；`/api/cron/demo-reset` 仍返回预期 `503`。对应 Vercel runtime logs 全为 info，无 error/warning。
- Privileged Supabase client 只在已登录顾客查询/写入或受保护后台路径惰性初始化；当前未伪造身份或临时增加探针路由。平台 Hidden/Secret 清单与成功 redeploy 已确认配置进入部署，真正的 privileged 查询留待 Google OAuth 登录配置完成后验收。
- 用户明确授权把 Guest 本地 `.env.local` 中现有 `AUTH_GOOGLE_ID` 与 `AUTH_GOOGLE_SECRET` 写入 Vercel 项目 `the-wild-oasis-website-ai` 的 Production/Preview/Development。只读取这两个指定字段；Client ID 作为 Config、Client Secret 作为 Hidden/Secret 经标准输入传输，未回显值、未覆盖本地文件，也未读取/复制旧 Supabase secret。
- OAuth deployment `dpl_3BiwbY7idybtye68tfCsiH69bEWC` 远端状态为 `READY` 并接管 production alias。CLI 等待回执时曾在 lint/typecheck 已通过后返回通用 `fetch failed`，独立 `vercel inspect` 证明这是本地连接中断而非 build failure，因此没有创建重复 deployment。
- 新 deployment 的 `/login` 与 `/api/auth/providers` 均返回 `200`，provider JSON 精确生成 production callback `https://the-wild-oasis-website-ai.vercel.app/api/auth/callback/google`。直接 GET signin endpoint 返回 `302`，runtime log 明确为 Auth.js `UnknownAction: Unsupported action`；真实代码通过 Server Action POST 发起登录，故该 GET 不是有效 OAuth 失败证据。
- 尝试用隔离 Playwright 会话点击真实按钮，但两次 CLI 命令均未输出快照、也未生成新的会话文件；按排障停止条件终止，没有访问用户 Chrome、Google 账号或提交授权。真实 Google 登录、callback 后 guest 查询/创建和 session guestId 仍保持人工验收待办。
- 用户随后在 Google OAuth Web client 添加 production callback，并在真实浏览器登录成功。Vercel 日志显示成功时序为 `/api/auth/callback/google` `302` → `/account` `200` → reservations/profile `200`；这实际执行了 signIn callback 中 privileged `getGuest`/必要时 `createGuest` 与 session callback 的 guestId 查询。日志未读取或记录账号内容。
- 同批日志发现 `/account/profile` 虽返回 `200`，服务端仍有 `TypeError: i.find is not a function`。根因为页面调用旧 `https://restcountries.com/v2/all` 并假设顶层数组；当前服务返回非数组错误对象，导致 `countries.find` 崩溃。此前 `iss missing` callback error 的时间早于成功登录，属于登记 callback 前的历史失败，不是当前链路回归。
- Guest 提交 `8134ccb fix: remove fragile country API dependency` 删除运行时国家 API 调用，新增 249 个 ISO alpha-2 code 清单，用 Node `Intl.DisplayNames` 生成英文名称并按既有 `flagcdn.com/{code}.svg` 约定构造旗帜 URL；未知旧数据库国家名作为临时 option 保留，空 nationality 正确显示 placeholder。
- 新增 `tests/countries.test.ts` 覆盖 249 个唯一 code、US/CN 映射、排序、HTTPS flag URL 与缓存引用。Guest 完整 `npm run check` 通过：lint、typecheck、41 files/530 tests、Next production build；只保留 4 个既有 `<img>` warning 和 Windows webpack cache `EPERM` warning。
- 修复提交已推送 Guest `main`，production deployment `dpl_nbKo1DVXGa7ipFxqS3RNCwtbus7g` 状态 `READY` 并接管正式 alias。重新验证登录页/provider `200`、callback 精确、Cron 关闭态 `503`；仓库 production smoke 在单独直连执行时通过。用户随后在现有登录会话刷新 Profile，确认页面和国家下拉框正常显示，本修复的人类验收通过。
