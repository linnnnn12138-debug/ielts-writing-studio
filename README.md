# IELTS Writing Studio

一个使用 React、Tailwind CSS 和 localStorage 构建的雅思写作学习记录网站。

## 运行

推荐直接双击 `start-site.cmd`，它会启动本地服务器并自动打开网站。React、Tailwind 和 Babel 已保存在 `vendor` 目录，无需联网或安装依赖。

也可以手动使用任意静态服务器：

```powershell
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 已实现

- Dashboard 学习统计
- 作文新建、编辑、删除、筛选
- 富文本工具栏、字数统计、自动保存
- IELTS 四项评分和总分计算
- LanguageTool 免费英文语法与拼写检查
- Word 风格修订批注：原文高亮、红色删除线、绿色新增内容
- 修订审批：接受后自动替换正文，拒绝后保留原文
- 每篇作文可保存高分范文和重点词汇
- 作文笔记和解决状态
- 自动保存修改历史与历史版本恢复
- 主题、题型、分数和状态管理
- localStorage 本地持久化
