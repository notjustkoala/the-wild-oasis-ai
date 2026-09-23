# Deployment and Demo Data Runbook

## 当前发布状态

截至 2026-09-23，两个源码仓库已发布，隔离 Supabase Demo Project 已完成迁移、seed、Storage 图片与 rollback-only SQL 验证。Guest/BFF 已从 clean commit 发布到 Vercel production，并通过仓库 production smoke 与只读 Demo 数据 API 复核；现代 Supabase secret 和 Google OAuth 凭据已按 Config/Secret 边界写入三个环境。用户已登记 production callback 并真实登录成功；登录后 Profile 暴露的旧国家 API 依赖已修复并重新部署，等待已登录浏览器刷新确认。Staff 仍未发布，模型凭据与 Staff exact origin 尚未完成最终配置，因此当前 URL 仍不算完整人工验收。

| Surface | 建议平台 | 目标域名角色 | 实际 URL |
| --- | --- | --- | --- |
| Guest + AI BFF | Vercel | `guest.example` 仅作需求中的角色占位 | [`https://the-wild-oasis-website-ai.vercel.app`](https://the-wild-oasis-website-ai.vercel.app)（production，首次 smoke 已通过） |
| Staff SPA | Netlify | `staff.example` 仅作需求中的角色占位 | 待配置，不能用占位域名冒充 |
| Shared data | 专用 Supabase Demo Project | 两端共享；与生产隔离 | [`wild-oasis-demo`](https://supabase.com/dashboard/project/fadfglcobmxxsawxlmpb)，`ap-southeast-1`，`ACTIVE_HEALTHY` |

## 信任边界与环境变量

### Staff / Netlify（浏览器可见）

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_AI_BFF_URL`：Guest/BFF 的真实 HTTPS origin，不带路径

任何 `VITE_` 变量都会进入客户端 bundle。禁止放入 Supabase secret/service-role、模型 key、反馈签名 secret 或演示账号密码。

### Guest/BFF / Vercel（server-only，除 publishable key 外）

- Supabase：`SUPABASE_URL`、`SUPABASE_PUBLISHABLE_KEY`、`SUPABASE_SECRET_KEY`
- Auth：`NEXTAUTH_SECRET`、OAuth provider 变量、`AUTH_TRUST_HOST`
- AI：`AI_PROVIDER` 和对应 provider key；可选模型覆盖
- 双端绑定：`AI_ADMIN_ORIGIN` 必须是 Staff 的精确 HTTPS origin；需要多个明确部署时用逗号分隔，不能用 `*`
- Observability：稳定的 `AI_OBSERVABILITY_SECRET`
- Demo reset：`DEMO_RESET_ENABLED=false` 默认关闭；独立随机
  `CRON_SECRET` 至少 32 字符，供 Vercel 以 Bearer header 调用

完整字段与安全注释见 [Guest `.env.example`](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/.env.example) 和 [Staff `.env.example`](../../.env.example)。所有秘密只在平台环境变量面板配置，不进入 Git、浏览器 bundle、截图或聊天。

## 部署顺序

1. 创建与任何真实生产/课程原始项目隔离的 Supabase Demo Project。
2. 审阅并按文件名顺序应用版本化 migration；新表需要显式 grants + RLS。不要从本 Runbook 自动执行远端命令。
3. 使用受审基础 seed 和固定 demo seed 初始化空的 Demo Project；生成器仍只负责本地 artifact，不获得远端写入能力。固定 seed 会在一个事务中写 bookings 与 private baseline。
4. 以数据库 owner 执行 rollback-only `supabase/tests/demo_reset.sql`，确认权限、重复执行、非 demo 保留、cascade 与失败回滚；未通过不得启用 Cron。
5. 在 Vercel 配置 Guest/BFF server-only 环境变量并发布；记录真实 HTTPS URL。首次保持 `DEMO_RESET_ENABLED=false`。
6. 在 Google OAuth Web client 中登记 Guest 的真实 HTTPS origin，以及精确 callback `https://<guest-host>/api/auth/callback/google`；顾客端使用 Auth.js Google 登录，不使用 Supabase Auth 密码账号。
7. 将 Guest URL 写入 Staff 的 `VITE_AI_BFF_URL` 后发布 Staff；取得 Staff URL 后，将其写入 BFF 的 `AI_ADMIN_ORIGIN` 并重新部署 Guest。
8. 用平台日志确认没有 secret 输出，用构建产物搜索确认客户端不存在 server secret/key 的值或变量名误用。
9. 创建最小权限演示身份，运行生产 smoke 和完整五分钟脚本。
10. 先以 `DEMO_RESET_ENABLED=false` 验证 route 失败关闭；rollback-only SQL 已通过后，临时改为 `true` 并重新部署，手动执行一次带 Bearer 的受保护调用并复核非 demo 行。只有本次验证成功才保持开关为 `true`、启用 Vercel Cron，并在日志确认一次实际 production 调用；任何失败都立即改回 `false` 并重新部署。

## 演示账号

仓库只登记角色与创建步骤，不保存真实邮箱或密码：

| 标识 | 权限 | 用途 | 创建/保管 |
| --- | --- | --- | --- |
| `DEMO_GUEST` | 普通顾客 | 预订预填、私有预订页面 | 使用专用 Google OAuth 测试账号；首次登录会按邮箱匹配或创建 `guests` 行，不创建 Supabase Auth 密码账号 |
| `DEMO_ADMIN` | `app_metadata.role=admin` | 仅用于 admin-only Risk Briefing 演示 | 独立账号；仅受信管理员写 `app_metadata`，不与日常账号共用 |
| `DEMO_STAFF` | `app_metadata.role=staff` | Copilot 只读、草稿审批/拒绝 | 只能由受信管理员写 `app_metadata`；不能访问 admin-only Briefing |
| `DEMO_DENIED` | 无 staff/admin role 或未登录 | 越权拒绝演示 | 不得通过 `user_metadata` 模拟角色 |

不要创建共享 service-role 登录，不要把密码写进 README/录屏脚本。公开演示环境应定期轮换密码并限制回调 URL。

## 演示数据恢复策略

现有 `scripts/generate-demo-data.mjs` 使用固定 seed `20260803` 生成 12 个月、800 条预订，并明确拒绝 remote flags。`supabase/seed.sql` 要求目标基础表满足精确前置且 bookings 为空。这个边界必须保留。

本地实现包含完整但默认关闭的安全链：

- `public.bookings.demo_dataset_id` 只能为 null 或固定
  `wild-oasis-demo-20260803-v1`；authenticated INSERT/UPDATE 的列级 grants
  排除该列，浏览器不能把普通订单伪装成 demo。
- `private.demo_booking_baseline` 不在 Data API 暴露 schema，启用并强制
  RLS；anon/authenticated 无 schema/table 权限，service role 只有 SELECT。
- 固定 seed 仍拒绝 remote flags，并要求 bookings/baseline 为空；同一事务
  写入 800 条 demo booking 与 baseline，任一后置条件失败都会整体回滚。
- 参数为空的 `public.reset_demo_bookings()` 使用 `security invoker`、空
  `search_path`，revoke PUBLIC/anon/authenticated、只 grant service role。
  它只删除固定 provenance 行（相关 Briefing/审批/audit 通过 FK cascade
  清理），再用显式字段从 baseline 恢复，不触碰非 demo 行并校正 identity
  sequence。
- `pg_try_advisory_xact_lock` 防止重叠执行；重复调用恢复同一 baseline，
  是幂等的。锁占用返回受控 `busy`，任何删除/插入/约束错误在单事务中
  回滚，不留下半恢复状态。
- `/api/cron/demo-reset` 仅在 flag 精确为 `true`、`CRON_SECRET` 强度合格
  且 Bearer 完全匹配时调用固定 RPC；不回显数据库错误或业务行。
- `vercel.json` 配置每天 UTC 03:00 一次，满足 Hobby 每日一次。Cron 只在
  production deployment 生效；Vercel 可能重复/重叠投递，由锁和幂等保证。

2026-09-23 已在隔离项目 `fadfglcobmxxsawxlmpb` 应用 11 条版本化 migration，
写入 8 cabins、1 settings、30 guests、800 demo bookings 与 800 private baseline，
并上传 8 张 cabin 图片。首次 rollback-only SQL 暴露
`service_role` 缺少 `booking_ai_insights` 只读权限；新增最小 SELECT migration 后
完整套件通过，回滚后仍精确保持 800/800 且无临时测试行。Cron route 已随 Guest
production deployment 发布；无凭据 GET 返回预期 `503`，Vercel 日志确认请求命中
production serverless route。`DEMO_RESET_ENABLED` 继续保持 `false`，尚未执行启用态
手动调用或激活验收。

紧急停用：把 `DEMO_RESET_ENABLED=false` 并重新部署，同时在 Vercel 禁用
Cron。不要删除 route 鉴权、直接给浏览器 service secret，或绕过本地生成器
向任意远端写入。

## 生产 Smoke

两个仓库分别提供 `npm run smoke:production`。脚本只接受对应的显式环境变量，要求真实 `https://`，并拒绝 localhost、私网和 `.example`/`.test` 占位域；缺失时以非零状态退出。

```bash
# Guest/BFF
$env:GUEST_PRODUCTION_URL='https://REAL_GUEST_HOST'
npm run smoke:production

# Staff
$env:STAFF_PRODUCTION_URL='https://REAL_STAFF_HOST'
npm run smoke:production
```

Smoke 只证明 HTTPS 首页可达和返回预期 app marker，不证明登录、数据库、AI provider 或审批链完整。发布验收还必须人工运行 [Demo Script](DEMO_SCRIPT.md)；不得把本地 `npm run dev` 结果登记为生产 smoke。

## 发布检查表

- [ ] 两个真实 URL 均为 HTTPS，且不是 preview/占位域（Guest 已完成，Staff 待发布）。
- [ ] Staff 与 BFF exact-origin CORS 双向配置正确。
- [ ] 浏览器 bundle 不含 server secret、provider key 或密码。
- [ ] Supabase grants、RLS、角色 `app_metadata` 与受控审批迁移已应用到指定 Demo Project。
- [ ] `DEMO_ADMIN` 仅用于 Briefing；`DEMO_STAFF` 用于 Copilot；拒绝账号无法访问员工 AI。
- [x] Reset migration/seed/rollback-only SQL 已在隔离 Demo Project 验证；Cron flag 仍保持关闭，部署后才按步骤临时启用。
- [ ] Vercel production Cron 日志显示受保护 route 成功；重复/重叠安全边界已复核。
- [ ] 两端 `check`、`docs:check` 与真实生产 smoke 通过（本地检查均已通过；Guest production smoke 已通过，Staff 待发布）。
- [x] 两个独立 GitHub origin 已发布到 `main`，跨仓库链接已切换到新仓库固定路径并通过 Markdown 检查。
- [ ] 三次五分钟演练、2–3 分钟备用录屏和陌生读者验证完成。
