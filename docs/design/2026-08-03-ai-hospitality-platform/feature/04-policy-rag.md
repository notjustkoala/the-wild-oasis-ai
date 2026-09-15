# 政策知识库 RAG 实施步骤

**2026-09-15 状态**：实际设计见 `../../2026-08-29-policy-rag/`；人工验收、最终规格/质量审查和两端回归已完成（网站 441、员工端 70 测试及构建通过）。真实登录角色、变化 Chunk embedding 和修正后答复回归等待授权，尚未正式关闭。证据汇总见网站仓库 `tests/ai/policy-rag-closeout.md`。

------禁止调整，保持原样------
> 该文档是技术方案文档的一部分，执行该文档前必须对`../TECHNICAL_SPEC.md` 有了解
- **For Claude Code:** 使用find命令协助你检索，项目中若存在 `.cursor/rules` 文件夹，遵循里面的规则

------禁止调整，保持原样------

**目标**: 为酒店政策、FAQ 和员工 SOP 提供带权限、带引用的语义检索，不将结构化库存和订单误做向量检索。

**文件清单**:
- 创建: 知识文档、Chunk、Embedding 与权限 migration
- 创建: `21-the-wild-oasis-website/content/policies/`
- 创建: `21-the-wild-oasis-website/app/_ai/tools/policy-search.ts`
- 创建: Embedding 导入脚本
- 创建: 顾客端与后台 Citation 组件

---

## 任务 1: 准备可引用的知识源

**文件**:
- 创建: `content/policies/public/*.md`
- 创建: `content/policies/staff/*.md`

**实现**:
```yaml
id: pet-policy
title: Pet policy
scope: public
version: 1
effectiveDate: 2026-08-03
```

文档至少覆盖入住/退房、宠物、早餐、取消、付款、无障碍和员工异常处理 SOP；每条规则有稳定 ID 与版本。

**验证**:
- 运行: 内容 Schema 检查
- 检查: 每个文档有标题、scope、版本和生效日期；内容之间无明显冲突

---

## 任务 2: 建立 Chunk、Embedding 与权限模型

**文件**:
- 创建: Supabase migration
- 创建: Embedding 导入脚本

**实现**:
```ts
type KnowledgeChunk = {
  documentId: string;
  content: string;
  headingPath: string[];
  scope: "public" | "staff";
  version: number;
};
```

学习前置：Embedding、Chunk overlap、相似度、Hybrid Search、召回率、RLS。先用小数据验证，不提前调复杂索引。

**验证**:
- 运行: ingestion dry run 与 retrieval tests
- 检查: 更新文档只重算受影响 Chunk；public 身份永远检索不到 staff 内容

---

## 任务 3: 实现带来源的检索工具

**文件**:
- 创建: `app/_ai/tools/policy-search.ts`
- 修改: Concierge 与 Operations Agent 工具列表

**实现**:
```ts
type PolicySearchResult = {
  answerContext: string;
  citations: Array<{ documentId: string; title: string; section: string; version: number }>;
};
```

无高质量检索结果时明确表示“不确定”，不允许使用模型记忆补写酒店政策。

**验证**:
- 运行: policy retrieval Eval
- 检查: 答案中的政策事实都能定位到允许访问的来源；无结果问题不会编造答案

---

## 任务 4: 渲染引用与反馈

**文件**:
- 创建: `PolicyCitation.tsx/jsx`
- 修改: 两端 AI 消息渲染器

**实现**:
```ts
// 点击引用展示文档标题、章节、版本和支持当前答案的短摘录。
```

**验证**:
- 运行: UI 测试与键盘可访问性测试
- 检查: 引用可点击、可聚焦；顾客端不会暴露 staff 文档标题或片段

---

## 人类验证点

🔍 **需要人类搭档验证**:
- 测试: 顾客询问宠物政策，员工询问异常入住 SOP，再尝试从顾客端诱导泄露员工文档
- 确认: 正常问题有准确引用；不同角色得到不同检索范围；越权诱导失败

---

## 功能点完成

**最终验证**:
运行: RAG tests、RLS tests 与两端 build
检查:
- ✅ 引用可追溯且知识版本明确
- ✅ public/staff 权限隔离通过
- ✅ 库存、价格与订单未使用向量检索

**完成后**: 向 Controller 汇报实施结果，由 Controller 统一安排审查和提交流程。
