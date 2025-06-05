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
        detail: vscode.l10n.t("Camel Case - For variable names and function names"),
        value: translations.camelCase,
        format: "camelCase",
      },
      {
        label: `$(symbol-class) ${translations.PascalCase}`,
        description: "PascalCase",
        detail: vscode.l10n.t("Pascal Case - For class names and component names"),
        value: translations.PascalCase,
        format: "PascalCase",
      },
      {
        label: `$(symbol-method) ${translations.snake_case}`,
        description: "snake_case",
        detail: vscode.l10n.t("Snake Case - For Python and database fields"),
        value: translations.snake_case,
        format: "snake_case",
      },
      {
        label: `$(symbol-constant) ${translations.CONSTANT_CASE}`,
        description: "CONSTANT_CASE",
        detail: vscode.l10n.t("Constant Case - For constant definitions"),
        value: translations.CONSTANT_CASE,
        format: "CONSTANT_CASE",
      },
      {
        label: `$(symbol-string) ${translations["kebab-case"]}`,
        description: "kebab-case",
        detail: vscode.l10n.t("Kebab Case - For CSS class names and file names"),
        value: translations["kebab-case"],
        format: "kebab-case",
      },
    ]

    const quickPick = vscode.window.createQuickPick<TranslationQuickPickItem>()
    quickPick.items = items
    quickPick.placeholder = vscode.l10n.t("Select naming format to copy (Enter to copy to clipboard)")
    quickPick.canSelectMany = false

    quickPick.onDidChangeSelection(async (selection) => {
      if (selection.length > 0) {
        const selectedItem = selection[0]
        await this.copyToClipboard(selectedItem.value)

        vscode.window.showInformationMessage(
          vscode.l10n.t("Copied {0}: {1}", selectedItem.format, selectedItem.value),
          { modal: false }
        )

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
      vscode.window.showErrorMessage(
        vscode.l10n.t("Copy failed: {0}", error instanceof Error ? error.message : vscode.l10n.t("Unknown error"))
      )
    }
  }
}
