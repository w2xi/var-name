import * as vscode from "vscode"
import type { TranslationResult } from "./translationProvider"

interface TranslationQuickPickItem extends vscode.QuickPickItem {
  value: string
  format: string
}

export class QuickPickManager {
  async showTranslations(translations: TranslationResult): Promise<void> {
    const items: TranslationQuickPickItem[] = [
      {
        label: `$(symbol-variable) ${translations.camelCase}`,
        description: "camelCase",
        detail: "驼峰命名法 - 适用于变量名、函数名",
        value: translations.camelCase,
        format: "camelCase",
      },
      {
        label: `$(symbol-class) ${translations.PascalCase}`,
        description: "PascalCase",
        detail: "帕斯卡命名法 - 适用于类名、组件名",
        value: translations.PascalCase,
        format: "PascalCase",
      },
      {
        label: `$(symbol-method) ${translations.snake_case}`,
        description: "snake_case",
        detail: "下划线命名法 - 适用于Python、数据库字段",
        value: translations.snake_case,
        format: "snake_case",
      },
      {
        label: `$(symbol-constant) ${translations.CONSTANT_CASE}`,
        description: "CONSTANT_CASE",
        detail: "常量命名法 - 适用于常量定义",
        value: translations.CONSTANT_CASE,
        format: "CONSTANT_CASE",
      },
      {
        label: `$(symbol-string) ${translations["kebab-case"]}`,
        description: "kebab-case",
        detail: "短横线命名法 - 适用于CSS类名、文件名",
        value: translations["kebab-case"],
        format: "kebab-case",
      },
    ]

    const quickPick = vscode.window.createQuickPick<TranslationQuickPickItem>()
    quickPick.items = items
    quickPick.placeholder = "选择要复制的命名格式（回车复制到剪贴板）"
    quickPick.canSelectMany = false

    quickPick.onDidChangeSelection(async (selection) => {
      if (selection.length > 0) {
        const selectedItem = selection[0]
        await this.copyToClipboard(selectedItem.value)

        vscode.window.showInformationMessage(`已复制 ${selectedItem.format}: ${selectedItem.value}`, { modal: false })

        quickPick.hide()
      }
    })

    quickPick.onDidHide(() => {
      quickPick.dispose()
    })

    quickPick.show()
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(text)
    } catch (error) {
      vscode.window.showErrorMessage(`复制失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }
}
