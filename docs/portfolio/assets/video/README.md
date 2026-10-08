# 字幕备用演示

[下载/播放WebM](automated-fixture-demo.webm) · [离线播放器](preview.html)

当前视频为自动化界面演示：真实Guest已部署页面与本地Staff应用，AI/Auth/审批使用合成HTTP数据，所有操作标注在画面。无真实账号、客人资料、模型调用或生产写入；不是生产E2E或真人计时验收。画面提供中文字幕，没有语音。

| 项目 | 值 |
| --- | --- |
| 日期 | 2026-10-08（Asia/Shanghai） |
| 分辨率 | 1920×1080 |
| 格式 | WebM / VP8 / 25fps |
| 实际时长 | 158.64秒（2分38.64秒，容器元数据） |
| 大小 | 11,815,985 bytes |
| SHA-256 | 5ce44974a71bbd2fe807d9a550461ca5e869fd4d18fa0e618da4bb736758c2fc |
| 公开版本位置 | [GitHub main视频](https://github.com/notjustkoala/the-wild-oasis-ai/blob/main/docs/portfolio/assets/video/automated-fixture-demo.webm) |

内容：顾客需求→推荐卡与理由→采用方案进入预填；员工Copilot草稿→提交；管理员原始留言/风险Briefing/纠错表单→审核；员工结果与订单备注回显；员工越权页拒绝；模型、向量和当前记忆边界。

录制使用新建隔离浏览器上下文，只有合成显示名称与固定合成UUID；未登录真实顾客账号。画面抽帧及离线解码检查用于核对字幕、房型图片、Briefing和审核页，无供应商控制台、环境变量、密码、请求头或真实邮箱。

隔离浏览器在offline模式已实际加载、解码并播放推进，通过1920×1080、158.64秒与SHA核验。下载本目录的播放器和视频到同一文件夹，打开preview.html即可离线播放。配合[静态当前模型报告](../../CURRENT_MODEL_EVALUATION.md)讲解。若补录真人讲解版，遵循[Demo Script](../../DEMO_SCRIPT.md)隐私与录制清单；真人三次计时和陌生读者反馈仍需真实登记。
