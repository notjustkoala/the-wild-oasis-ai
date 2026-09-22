# Feature05 验收与证据矩阵

此文件描述待验证项目，不代表已通过。实时状态以 `../../FEATURE05_PROGRESS.md` 为准。

## 自动验证的证据边界

| 层级 | 要验证的实际行为 | 可证明 | 不能据此声称 |
| --- | --- | --- | --- |
| L1 生产函数/工具 | 参数校验、数值约束、授权、审批、隐私、指标汇总 | 给定输入和依赖下的确定性行为 | 自然语言模型理解正确率 |
| L2 Mock Agent | 真实SDK执行工具/流事件、取消/失败、callbacks | 协议和执行契约 | live模型、真实网络或数据库通过 |
| L3 live | 固定合成问题、真实模型及开发数据库 | 本批场景的实际耗时、用量与答复事实 | 所有未来请求正确、一次全绿（若分批重跑） |
| L4 浏览器 | 两端实际页面操作及请求路径 | UI状态、反馈/trace展示、普通业务入口可用 | 被HTTP替换的后端已真实执行 |
| SQL事务 | 真实Postgres角色、grants、RLS与原子RPC | 数据库行为和回滚清理 | 普通用户真实登录的完整HTTP链路 |

## 必须保留的负例

- Eval runner：重复ID、未知场景/约束、坏JSONL、缺结果、适用分母为0、执行异常及故意不满足期望的输出。
- Metrics：0是已知值、null是未知；TTFT仅来自首文本增量；P95算法明确；model/pricing版本不得省略。
- Observer：并发结束、超时和正常finish竞争、取消、错误后finish、工具失败后仍有自然语言输出、存储挂起/异常。
- Privacy：异常message、prompt、tool input/output含假邮箱/证件号/token时，写入值只含白名单；provider自定义model ID也不能任意注入自由文本。
- Feedback：仅知道traceId、坏签名、过期、跨run替换、未知run、运行尚未完成、过大body、未知评分、跨源；重复反馈更新而非无限累积。
- Rate limit：同时消费最后一个配额、超限返回Retry-After、窗口过期、RPC不可用、伪造XFF、普通用户伪造app_metadata/user_metadata、不同AI surface的key语义。
- Authorization：匿名/普通/员工/管理员表与RPC权限；不能经遥测service client获得政策SOP/业务权限。
- Regression：原审批拒绝、幂等写、政策只解释不写、当前问题隔离、中文PII保守处理均保持。

## 人工四场景（实现完成后补充实际地址和trace）

| 场景 | 操作 | 预期UI | 预期追踪 |
| --- | --- | --- | --- |
| 成功 | 顾客询问明确日期人数的房型，或员工询问支持的经营指标 | 有业务证据的结果，能找到请求编号并提交结构化反馈 | 成功状态、版本、工具、用量；不保存原对话 |
| 无结果 | 使用固定fixture的无库存条件，或无政策证据场景 | 明确无结果/证据不足，不编造；可继续普通筛选 | 完成状态与工具返回分类清晰，无结果不等于模型故障 |
| 模型超时 | 测试环境可控地使模型超时 | 可理解的重试提示和请求编号，普通业务入口可用 | timeout而非success，非文本响应TTFT为null |
| 越权 | 不具员工权限访问受限AI接口/业务工具 | 401/403或受控拒绝；无受限信息或未审批写入 | denied分类，可由管理员按编号定位，无原token |

用户确认前不会将人工验收标为完成。开发中不得通过公开生产环境的测试开关制造超时/绕过权限。

## 数据库当前基线（2026-09-17）

只读确认项目 `tupdbxiujsfaifqulgmt` 为 `wild-oasis-dev`、ACTIVE_HEALTHY、Postgres17。

- public schema 尚无 `ai_%` 表。
- 安全advisor已有两项审批函数 SECURITY DEFINER 告警及一个未启用泄漏密码保护告警；本阶段迁移后与此基线对比。
- [Supabase函数告警说明](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [密码保护说明](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)

不得将这些历史告警冒充本次新增问题，也不得以基线存在告警为由忽略新表的RLS/授予缺口。
