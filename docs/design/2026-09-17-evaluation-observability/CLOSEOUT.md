# Feature05 收尾记录

日期：2026-09-21。范围：顾客网站/BFF、运营后台、共享开发库的评测、可观测与安全加固。实时状态仍以 [统一进度](../../FEATURE05_PROGRESS.md) 为准。

## 审查与验收

- 规范审查：PASS。初审发现离线硬约束只核对输出自洽的 P2，补独立库存/日期/人数/预算 oracle 和 12 个真实执行反例后，原审查代理复审通过。
- 人工验收：用户于 2026-09-21 19:48（Asia/Shanghai）明确回复“我已验收通过”；[四场景材料](MANUAL_ACCEPTANCE.md) 保留供回归复现。
- 代码质量审查：进行中；结论尚未写入。
- 阶段关闭：等待质量审查结束。代码与文档保持未提交，没有部署发布或开启 Feature06。

## 需求覆盖

| 原始任务 | 实际交付 | 证据 |
| --- | --- | --- |
| 分层确定性测试 | 生产函数/真实 SDK Mock Agent、双端 UI 与浏览器测试，默认测试不调用付费模型 | 两端 test/check；浏览器 JSON 及截图 |
| 50–100 条统一 Eval | 69 固定 JSONL；20 条独立 expectedStay；工具名/调用ID/输出schema及固定库存事实校验 | 网站 `tests/ai/evals/`、`tests/ai/fixtures/`；18 项 runner/反例测试 |
| 最小可观测链路 | Concierge/Operations/Booking Insight 元数据、trace、耗时/TTFT/用量、工具错误、版本、签名评分反馈 | `app/_ai/observability/`、反馈路由、SQL迁移及权限证据 |
| 安全与降级 | 服务端原子限流、429 Retry-After、工具原有授权审批门禁、存储有界降级、非AI业务入口 | 并发HTTP、真实拒绝HTTP/denied trace、权限/取消/超时测试及双端E2E |

实现沿用原有双端架构、模型配置和业务权限。内部静态报告脚本满足原方案“内部报告页面或静态报告生成脚本”的选择；没有新增报告后台页面。业务表读写仍使用原身份/RLS，遥测专用 service client 不传入经营或政策工具。

## 自动验证

| 检查 | 实际结果与边界 |
| --- | --- |
| 网站完整 `npm run check` | 2026-09-21 exit 0：38文件/495测试、lint/typecheck及14页构建；日志 `output/feature05-final-check-20260921.log`。此批在最后的纯Eval修复之前 |
| 后台完整 `npm run check` | 2026-09-21 exit 0：8文件/70测试、lint/typecheck和Vite构建；另对4个变更TS/TSX显式eslint通过 |
| 最后Eval修复验证 | `typecheck` exit 0；18/18 runner测试（包含全部69用例与12新增反例）通过；`eval:ai` exit 0，报告时间2026-09-21T11:43:26.648Z |
| 离线指标 | 工具45/45、硬约束69/69、引用24/24、授权64/64；其余不适用样本明确跳过。是离线契约/合成检索结果，不是模型准确率 |
| 双端浏览器 | 各5/5通过，包含成功/反馈、无结果及普通业务入口、504/403重试、取消；各4张截图。使用HTTP fixture，不能据此宣称真实后端执行 |
| 真实并发HTTP | 5请求、limit=2：2允许/3拒绝，5/5 HTTP200，临时bucket清理后0残留；前两次失败在进度中保留 |
| 真实拒绝HTTP | 未登录员工接口401、跨源403、无效body400、伪造反馈403；3个生成入口拒绝trace独立查询为denied；无模型调用 |
| 真实数据库权限 | 匿名/普通/员工/管理员读写矩阵、service CRUD、FK/唯一性、无效限流参数/窗口、30天保留与级联清理通过，事务回滚 |
| 文档与差异 | 两端diff-check通过；人工材料的本地链接全部存在 |

离线报告：[最新JSON](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/offline.json)、[最新Markdown](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/offline.md)。旧报告及最初17/18失败记录在网站 `tests/ai/reports/history/`，不因修复覆盖历史结论。

数据库证据：[初批事务](database-verification.json)、[扩展权限/保留验证](database-extended-verification.json)、[真实并发HTTP](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/database/concurrency-1789905042853.json)。迁移 `20260918020821_ai_observability.sql` 已应用开发库，三表RLS于2026-09-20再次只读确认。

## 真实模型批次

模式为真实既有模型 `gemini-3.6-flash` + 合成业务工具 + 真实开发库遥测。所有场景不写订单；评分由测试程序生成，不代表用户满意度。

| 批次报告 | 场景通过 | 遥测/反馈 | P50 / P95（ms，nearest-rank） | 说明 |
| --- | --- | --- | --- | --- |
| [2026-09-20 首批](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-20T11-56-29.498Z.json) | 8/10 | 10/10 | 7807 / 20264 | 无库存、工具故障生成失败；原始报告保留 |
| [2026-09-21 定向两项](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-21T06-57-22.732Z.json) | 0/2 | 2/2 | 8080 / 8112 | 重试异常/模型API异常，无HTTP状态；未确定具体网络根因 |
| [无库存补验](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-21T07-04-35.113Z.json) | 1/1 | 1/1 | 12746 / 12746 | 相同模型/断言通过 |
| [工具故障补验](https://github.com/notjustkoala/the-wild-oasis-website-ai/blob/main/tests/ai/reports/live/2026-09-21T07-06-17.929Z.json) | 1/1 | 1/1 | 18601 / 18601 | 故障恢复场景通过，run仍正确为failed/tool-error，2次工具错误 |

10 个不同固定场景分批取得通过；不能表述为一次全套10/10，也不把补验耗时拼接为一批延迟分布。没有配置价格文件，成本保持未知；非流式没有TTFT。首批失败场景的部分Token累计问题已修复，后续provider中断总量为null，首批原始值不用于成本估算。

## 运行说明与保留限制

- 两端README与网站环境示例已补运行命令、跨源配置、迁移、trace诊断和显式清理步骤。
- 反馈凭证1小时有效，绑定trace/surface；只有请求编号不足以写反馈。匿名顾客限流共享20次/分钟，已验证员工按身份摘要及surface限流30次/分钟，不信任任意XFF。
- 遥测HTTP写入1.5秒、外层1.6秒有界；失败不替换业务响应。失败时可能没有可查trace，反馈可重试。限流存储失败则仅AI安全降级。
- 30天清理命令需要显式执行；没有创建云端定时任务。其他环境部署前需应用迁移和服务端秘密配置。
- SQL权限证据是实际角色事务，不冒充普通用户完整登录HTTP测试；真实HTTP负例与浏览器fixture证据单独标注。
- 既有两项审批SECURITY DEFINER和密码保护WARN未在本阶段改变；service-only限流表无客户端policy是预期INFO，未新增本阶段安全WARN。
- 保留所有设计、进度、失败和回归记录；阶段完成不等于Git提交或上线。
