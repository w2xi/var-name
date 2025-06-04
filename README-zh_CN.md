# 🔤 Var Name

[English](./README.md) | 中文

一个基于大模型的VSCode插件，用于将中文翻译成多种编程语言的变量命名格式。

## ✨ 功能特性

- 🚀 快捷键调用（Ctrl+Shift+T / Cmd+Shift+T）
- 🤖 支持多种AI模型（OpenAI、DeepSeek、Qwen等）
- 📝 生成多种命名格式：
  - camelCase（驼峰命名法）
  - PascalCase（帕斯卡命名法）
  - snake_case（下划线命名法）
  - CONSTANT_CASE（常量命名法）
  - kebab-case（短横线命名法）
- ⌨️ 键盘导航和一键复制
- ⚙️ 灵活的配置选项

## 📥 安装

1. 在VSCode中打开扩展面板（Ctrl+Shift+X）
2. 搜索 "Var Name"
3. 点击安装

## ⚙️ 配置

| 配置项 | 说明 | 可选值 |
|--------|------|--------|
| `var-name.provider` | AI提供商 | `openai` / `deepseek` / `qwen` |
| `var-name.apiKey` | API密钥 | 您的API密钥字符串 |
| `var-name.baseUrl` | 自定义API地址 | 可选的自定义端点 |
| `var-name.model` | 模型名称 | 模型标识符字符串 |

## 🎯 使用方法

1. 按下快捷键 `Ctrl+Shift+T`（Mac: `Cmd+Shift+T`）
2. 在输入框中输入中文文本
3. 等待AI翻译完成
4. 使用上下箭头选择命名格式
5. 按回车键复制到剪贴板

## 💡 示例

输入：`是否显示弹窗`

输出：
- camelCase: `isShowModal`
- PascalCase: `IsShowModal`
- snake_case: `is_show_modal`
- CONSTANT_CASE: `IS_SHOW_MODAL`
- kebab-case: `is-show-modal` 