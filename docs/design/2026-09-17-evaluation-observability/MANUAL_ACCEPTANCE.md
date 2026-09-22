# Feature05 人工验收材料

状态：2026-09-21 19:48（Asia/Shanghai），用户明确回复“我已验收通过”。四场景人工验收完成，后续进入质量审查。自动验证和历史失败见 [统一进度](../../FEATURE05_PROGRESS.md)。此文档不替代真实测试报告。

## 双端界面

浏览器测试运行实际 Next.js / React 页面，替换 AI/反馈 HTTP；后台身份和业务数据也是 fixture，网站房型页读取开发库。没有提交预订。截图中的 `00000000-0000-4000-8000-000000000005` 是固定测试编号，不是可查询的数据库 trace。

| 场景 | 顾客网站截图 | 员工后台截图 | 人工检查 |
| --- | --- | --- | --- |
| 成功与反馈 | [查看](https://github.com/notjustkoala/the-wild-oasis-video/blob/codex/ai-hospitality-platform/output/playwright/feature05-success.png) | [查看](../../../output/playwright/feature05-success.png) | 回答、请求编号和反馈按钮清晰可见；重跑时点击 Helpful 核对已保存提示 |
| 无结果 | [查看](https://github.com/notjustkoala/the-wild-oasis-video/blob/codex/ai-hospitality-platform/output/playwright/feature05-empty.png) | [查看](../../../output/playwright/feature05-empty.png) | 明确无结果，可进入普通房型筛选或订单页面 |
| 模型超时 | [查看](https://github.com/notjustkoala/the-wild-oasis-video/blob/codex/ai-hospitality-platform/output/playwright/feature05-timeout.png) | [查看](../../../output/playwright/feature05-timeout.png) | 错误提示可理解，编号可复制，重试与普通业务入口可用 |
| 越权拒绝 | [查看](https://github.com/notjustkoala/the-wild-oasis-video/blob/codex/ai-hospitality-platform/output/playwright/feature05-denied.png) | [查看](../../../output/playwright/feature05-denied.png) | 显示受控错误，无受限结果或反馈按钮，可以继续普通业务 |

截图是本机产物，位于两仓库忽略的 `output/playwright/`。在各仓库运行 `npm run test:e2e` 可重新生成；用 `npm run test:e2e -- --headed` 查看浏览器过程。需已安装 Edge（或设置 `E2E_BROWSER_CHANNEL=chrome`）。网站使用端口 3100，后台使用 5174；关闭占用这些端口的旧测试进程后运行。

成功截图拍摄于提交反馈前；两端 E2E 随后均实际点击 Helpful 并断言 `Feedback saved.`，但该后续状态没有包含在这张截图中。不要把截图本身视为反馈持久化证据；真实开发库反馈由下面的 trace 查询验证。

## 真实追踪

在网站仓库的可信服务端环境运行：

```sh
npm run ai:observe -- trace 7d79b494-c942-4fa1-9bd9-3f04fb8c1089
npm run ai:observe -- trace 6dfb6b24-01ce-4179-a8f1-4a94ae944f7d
```

第一条是 2026-09-20 首批 live 的成功场景，第二条是真实 HTTP 匿名访问员工接口产生的拒绝场景。后者经独立 SQL 确认 `operations / denied / unauthorized`。这些记录受 30 天保留期约束，过期后应以新测试报告中的 trace 替代。

核对输出只包含编号、受控状态/错误码、耗时、Token、工具名、版本和结构化评分，没有用户原文、答复、工具参数、邮箱或凭据。live 反馈由测试程序生成，不能代表真实用户满意度；未配置价格的成本应保持 unknown。

## 确认结果

用户已确认上述人工验收通过。保留材料供后续回归复现；本阶段正式关闭状态以统一进度文档中的质量审查与收尾结论为准。
