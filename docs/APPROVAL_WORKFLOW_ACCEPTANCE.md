# 审批完整流程人工验收

按以下顺序操作，约需20–30分钟。所有提问都在员工端 Operations Copilot 中输入。本清单验证内部备注审批，不执行退款、取消订单或修改付款状态。

## 开始前

| 项目 | 准备方法 |
|---|---|
| 员工窗口A | 普通浏览器打开[员工端](https://the-wild-oasis-ai.vercel.app)，登录现有staff账号 |
| 管理员窗口B | 另一个浏览器或无痕窗口打开同一网站，登录现有admin账号；不要在同一浏览器的两个普通标签页切换账号 |
| 页面版本 | 两个窗口均Ctrl+F5；管理员侧栏应有Approvals，员工侧栏应有My requests |
| 演示订单 | 使用订单518，先打开[订单详情](https://the-wild-oasis-ai.vercel.app/bookings/518)，复制保存Internal note原文，并记下日期、房型、人数、总价、付款状态和订单状态 |
| 待办基线 | 管理员打开[Approvals](https://the-wild-oasis-ai.vercel.app/approvals)，Status选Pending review，记录当前数量；只处理本轮验收文字对应的申请 |

批准会替换整个Internal note字段。订单518属于当前项目演示数据；若改用其他订单，须先确认它是可测试订单，再把以下提问中的518全部替换。临时自动化测试账号和测试订单会在验证后删除，人验使用自己的现有账号。

页面通常每20秒刷新一次审批数据。角色间操作后，优先点击Refresh或刷新页面，不要求另一窗口立即变化。用备注中的A/B/C等标签区分同一订单的不同申请，并记录Request reference，以免处理错卡片。

## P1 — 角色与入口

1. 员工窗口A：侧栏打开My requests，正常显示自己的申请或空态。
2. 员工在地址栏直接输入`https://the-wild-oasis-ai.vercel.app/approvals`。
3. 管理员窗口B：侧栏打开Approvals，再点页面顶部My requests链接。

**通过标准：**员工无管理员Approvals入口，直达审批中心显示Access restricted，没有他人的申请或批准按钮；管理员能进入审批中心，也能查看自己的申请。测试无需修改账号角色。

## P2 — 起草、原文核对与草稿恢复

员工打开Operations Copilot，粘贴：

```text
为预订 518 起草内部备注：审批验收-A：请在入住前人工确认准备情况。
```

1. 等待返回Internal note · Booking #518卡片。
2. 核对文字完整且逐字为“审批验收-A：请在入住前人工确认准备情况。”。
3. 确认卡片显示Draft — not submitted，有Submit for approval、Withdraw request、View my requests，没有员工自行批准按钮。
4. 先不提交，点击View my requests。状态筛选选All requests或Drafts，找到A申请并记录Request reference。
5. 刷新页面，再退出并重新登录员工账号，回到My requests找A申请。
6. 管理员Refresh待审批页；员工检查订单Internal note。

**通过标准：**草稿跨刷新、重新登录保留，申请页状态Draft；管理员待办不包含未提交A草稿，订单原备注不变。刷新可能重置AI聊天，可从My requests继续处理已经落库的草稿。

## P3 — 员工提交与重复点击

1. 员工在A草稿上点Submit for approval；可在My requests或原Copilot卡片提交。
2. 提交时再次快速点击，观察按钮是否禁用；不需要打开开发者工具。
3. 等待显示Pending review，或Copilot显示Awaiting administrator review。
4. 员工刷新My requests，仍能找到同一个Request reference；管理员Refresh待办页。
5. 检查订单Internal note仍是原文。

**通过标准：**只有一条A申请进入待办，不因连点复制申请；提交不会写订单；员工没有Approve and save note或Reject request权限。未处理待办数量应相对本轮基线增加1，若有其他人同时操作，以A申请的reference为准。

## P4 — 管理员批准并保存

1. 管理员打开A申请的Review note and history。
2. 核对Booking #518、房型、日期、人数、Requested by、申请原文，以及Existing internal note和Proposed replacement。
3. 未勾确认框时，Approve and save note应禁用。
4. 勾选“I reviewed the proposed note. Approval replaces the existing internal note.”，点Approve and save note。处理中按钮禁用，不应出现重复执行。
5. A应从Pending review列表移除；Status改为History或Approved and saved，找到同一个reference。
6. 展开View note and history，查看审核人、审核/保存时间和事件历史。
7. 员工刷新订单518详情。

**通过标准：**历史状态Approved and saved，显示管理员审核信息；事件包含Draft created、Submitted for review、Approved、Internal note saved，执行事件只有一次。订单Internal note完整变为A文字；日期、房型、人数、总价、付款及订单状态与开始前一致。历史申请没有重新批准入口。

## P5 — 员工结果通知与已读持久化

1. 员工Refresh My requests，找到A。
2. 应出现Approved and saved、审核人/时间、New approval result和Mark as read；页顶部或侧栏显示未读结果提醒。
3. 先刷新一次，确认未读提醒仍保留。
4. 点Mark as read，刷新，再退出/登录员工账号查看A。
5. 若保留了原Copilot卡片，重新打开面板，等待约20秒查看其结果状态。

**通过标准：**A标记已读后不再显示Mark as read或New approval result；若有其他未读历史结果，总提醒数字可以不归零，应以A卡为准。原卡片可同步终态，处理后的申请不能再提交。

## P6 — 拒绝原因与不写订单

员工新提问：

```text
为预订 518 起草内部备注：审批验收-B：此条用于验证拒绝流程，请勿写入订单。
```

1. 员工核对B文字，提交，记录B reference。
2. 管理员Refresh待办，打开B。Review comment为空或只有空格时，Reject request应禁用。
3. 输入“验收拒绝：备注内容不符合本次处理要求。”，点Reject request。
4. 管理员在History或Rejected中找B；员工Refresh My requests，查看状态及Review reason。
5. 检查订单518Internal note，并尝试寻找B的再批准入口。

**通过标准：**双方显示Rejected，原因逐字正确、审核信息存在；B离开待审批列表，订单仍保留A文字；B不能重新提交或批准，需重新起草才能再申请。员工能将B结果标记已读。

## P7 — 未提交草稿与待审批申请撤回

先由员工提问：

```text
为预订 518 起草内部备注：审批验收-C0：此草稿将直接撤回。
```

不提交C0，直接点Withdraw request；刷新My requests验证Withdrawn。

再提问：

```text
为预订 518 起草内部备注：审批验收-C1：此申请提交后将由员工撤回。
```

1. 提交C1，管理员确认它进入Pending review，但不做决策。
2. 员工点Withdraw request；双方Refresh。
3. 管理员查看History或Withdrawn，员工查看自己的申请。

**通过标准：**C0/C1均持久显示Withdrawn；C1离开管理员待办，无批准/拒绝入口，事件包含Withdrawn；订单仍是A文字。撤回后刷新、重新登录不能把同一申请复活。

## P8 — 旧草稿与并发备注变化保护

员工先后起草两条，先都不批准：

```text
为预订 518 起草内部备注：审批验收-D旧稿：此条用于验证旧草稿不能覆盖新备注。
```

```text
为预订 518 起草内部备注：审批验收-E新稿：请保留这条已经批准的新备注。
```

1. 记录D/E reference，提交两条；确保两条都在E批准前创建。
2. 管理员先批准E。订单Internal note应变为E文字。
3. 管理员Refresh，打开仍待审批的D。
4. D应提示原备注发生变化，操作按钮变为Close outdated request。
5. 勾选核对框，点Close outdated request；双方Refresh，Status可选Outdated requests。

**通过标准：**D状态Outdated request，说明旧申请不能替换更新备注；历史出现冲突事件而没有Internal note saved；订单继续保留E，核心字段不变。不要为完成验收去修改房型、日期、人数或价格。

## P9 — 历史、筛选与页面操作

1. 管理员分别选择Pending review、History、Approved and saved、Rejected、Withdrawn、Outdated requests，核对A/B/C/D/E的分类。
2. 员工选Drafts、Pending review、All requests，确认自己的申请可找到，身份/状态和管理员决策一致。
3. 有超过20条匹配记录时验证Next/Previous分页；数量不足20条时记为“数据不足，未触发”，不要为此大量创建申请。
4. 将窗口缩到约390px，操作导航、筛选、展开备注、填写原因、批准/拒绝与滚动。
5. 可用Tab依次移动到筛选、Refresh、详情、确认框、理由和动作；失效或未勾选动作不能被触发。

**通过标准：**页面不横向溢出、不遮挡关键操作，备注按换行正常显示，状态和筛选准确。窄屏侧栏改为顶部可横向滚动导航。普通员工看不到别人的申请；如已有第二个员工账号，可额外验证，未准备则记录未测试。

## P10 — 失败重试与持久恢复（可选）

1. 在未执行的申请页面，使用浏览器网络离线模式再点Refresh或提交；观察失败提示。
2. 恢复网络，Refresh，查看服务器实际保存状态，再决定是否重试。
3. 审批过程中短暂断网后，恢复网络先检查History和订单备注。

**通过标准：**失败不显示虚假的“已保存”，不丢失服务器上的草稿或待办；即使响应丢失而服务器已执行，刷新后能看到正确终态，不重复保存。模型连接失败应单独记录；已有申请页的审批操作不需要调用生成模型。

## P11 — 恢复演示备注与结束核查

1. 撤回本次仍处于Draft/Pending review的验收申请，不处理其他人的申请。
2. 如果开始前保存的Internal note非空，员工先在输入框输入`为预订 518 起草内部备注：`，然后在冒号后粘贴完整原备注；不要添加新的验收标签，发送前核对原文。

3. 提交给管理员，管理员核对Proposed replacement确实是原备注，再批准；订单最终应与开始前的原备注逐字一致。
4. 再核对日期、房型、人数、总价、付款状态及订单状态未变。
5. 已批准/拒绝/撤回/失效的验收记录保留为审计历史。不要通过删除订单518来清除记录。

如果原备注为空，当前备注审批不支持空文本。请使用可保留验收备注的演示订单，或记录需要恢复为空，再交由管理员按项目维护方式处理。

## 反馈记录格式

```text
P1：通过/未通过/未测试
P2：通过/未通过/未测试
…
P11：通过/未通过/未测试
失败步骤：例如P4第4步
所用角色：员工/管理员
订单号和申请reference：
实际看到的按钮、状态或提示：
预期结果：
是否刷新后仍存在：
```

反馈截图只截对应卡片和错误提示，避免包含账号凭据、客人联系方式或其他人的内部备注。
