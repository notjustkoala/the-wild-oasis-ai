# Feature06 开发进度与接续记录

> 本文件是 Feature06「作品集与简历交付」在两个仓库间共享的唯一进度记录。
> 新对话先读本文件，再核对两个仓库的实际 Git 状态；不要把计划、fixture 或本地结果写成生产证据。

## 当前接续点

- 最后更新：2026-09-23（Asia/Shanghai）。
- 当前阶段：Feature06「作品集与简历交付」。
- 当前状态：替代规范 reviewer 最终结论为 ✅ PASS；Feature06 进入人类验证阶段，质量审查尚未启动。用户已明确 Feature05 已验收并授权转入 Feature06；Feature05 旧记录中“最终代码质量审查进行中”是当时的历史中断状态，本文件没有补造该阶段 reviewer 结论。
- 当前执行项：隔离 Supabase Demo Project 已完成 migration、seed、Storage 与 rollback-only SQL 验证；Guest/BFF 已从 clean commit 重新发布到 Vercel production，现代 Supabase secret 已在三个环境生效，production smoke、只读 Demo 数据链路与失败关闭 Cron 已核验。Staff 尚未发布，Guest 的 Google/AI provider 与双端 origin 尚未补齐。
- 下一步：补齐 Google OAuth、模型 key，做登录后的 privileged 数据路径与 AI 人工验收；之后发布 Staff、回填双方 exact origin，再完成 Cron 手动启用验证。
- 当前阻塞：`AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET` 与 `GOOGLE_GENERATIVE_AI_API_KEY` 尚未获准/提供；Staff Netlify 部署与 `AI_ADMIN_ORIGIN` 因而仍待执行。Vercel 的 GitHub Login Connection 未建立，当前只能使用 CLI 发布而非自动 Git 部署。
- 正在运行的进程/测试：无；两端完整 `check` 与本轮针对性测试均已结束。
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
| F06-02 | 部署配置、环境边界与演示数据保护 | 已完成（本地范围） | Netlify/Vercel 配置、env 注释、Runbook、fail-closed 恢复决策与 smoke 工具已落盘；真实发布阻塞 |
| F06-03 | 三段式演示、失败场景、截图与录屏清单 | 阻塞（外部） | 5 分钟脚本、失败场景、fixture 截图与 manifest 已完成；实际录屏/三次计时/陌生读者待人工 |
| F06-04 | Eval 报告与可追溯简历表述 | 已完成 | 每个数字链接真实报告；分批 live 口径准确；成本保持 unknown |
| F06-05 | 链接检查、smoke 工具、两端完整检查与收尾自审 | 已完成（本地范围） | 双端链接/完整 check、smoke 失败关闭、资产范围和配置语法验证通过 |
| F06-R1 | 修正 Briefing/Copilot 演示角色 | 已完成（本地范围） | 新增 DEMO_ADMIN，保持生产 admin-only Briefing 权限不变 |
| F06-R2 | 安全定时演示数据恢复链 | 已完成（本地实现；数据库演练阻塞） | 固定 provenance、私有 baseline、service-only RPC、默认关闭 Cron route、SQL/TS 测试已落盘；SQL 未实跑、远端未启用 |
| F06-R3 | 独立仓库公开链接稳定化 | 已完成（待发布后验证） | 跨 sibling 文档链接改为固定 GitHub 分支绝对 URL；注明未 push 前不可访问 |
| F06-R4 | Sequence 权限与 migration 初始化顺序 | 已完成（本地范围） | service_role 获得 `setval` 所需 UPDATE；SQL/合约断言；所有 versioned migrations 按文件名应用且不跳过中间迁移 |

## 已知证据边界

- 固定离线 Eval：69 条；工具选择 45/45、硬约束 69/69、引用 24/24、授权 64/64。这是离线契约/合成检索证据，不是模型准确率。
- 真实模型首批 10 个固定场景为 8/10，P50 `7807 ms`、P95 `20264 ms`；两个失败分别在后续单场补验通过。准确表述只能是“10 个不同固定场景分批取得通过”，不能写成单次 10/10。
- 成本没有经核验的价格文件，因此为 unknown/未测，不是 0。
- 两端浏览器各 5/5 使用 HTTP fixture；真实拒绝 HTTP 和真实开发数据库并发限流是不同证据层，不能混写成生产 E2E。
- 当前没有真实部署 URL、生产 smoke、可公开演示账号、录屏或三次真人计时证据。

## 变更日志

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

1. 配置并核验 Guest/Staff 真实 HTTPS URL，创建最小权限演示账号，按 Runbook 完成生产部署与双端 smoke。
2. 在本地/隔离 Demo Project apply migration 与 seed，实跑 rollback-only SQL 套件后再按 Runbook 启用定时恢复；当前实现已有固定 provenance，但尚未经过真实 PostgreSQL 演练、远端 apply 或 Cron 激活。
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
