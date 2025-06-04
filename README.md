# 🔤 Var Name

English | [中文](./README-zh_CN.md)

A VSCode extension powered by large language models that translates Chinese text into various programming language variable naming conventions.

## ✨ Features

- 🚀 Quick access via shortcut (Ctrl+Shift+T / Cmd+Shift+T)
- 🤖 Multiple AI model support (OpenAI, DeepSeek, Qwen, etc.)
- 📝 Generates multiple naming conventions:
  - camelCase
  - PascalCase
  - snake_case
  - CONSTANT_CASE
  - kebab-case
- ⌨️ Keyboard navigation and one-click copy
- ⚙️ Flexible configuration options

## 📥 Installation

1. Open the Extensions panel in VSCode (Ctrl+Shift+X)
2. Search for "Var Name"
3. Click Install

## ⚙️ Configuration

| Key | Description | Value |
|-----|-------------|--------|
| `var-name.provider` | AI Provider | `openai` / `deepseek` / `qwen` |
| `var-name.apiKey` | API Key | Your API key string |
| `var-name.baseUrl` | Custom API URL | Optional custom endpoint |
| `var-name.model` | Model Name | Model identifier string |

## 🎯 Usage

1. Press shortcut `Ctrl+Shift+T` (Mac: `Cmd+Shift+T`)
2. Enter Chinese text in the input box
3. Wait for AI translation
4. Use arrow keys to select naming convention
5. Press Enter to copy to clipboard

## 💡 Example

Input: `是否显示弹窗`

Output:
- camelCase: `isShowModal`
- PascalCase: `IsShowModal`
- snake_case: `is_show_modal`
- CONSTANT_CASE: `IS_SHOW_MODAL`
- kebab-case: `is-show-modal`