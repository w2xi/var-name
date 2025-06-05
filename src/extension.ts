import * as vscode from "vscode"
import { TranslationProvider } from "./translationProvider"
import { QuickPickManager } from "./quickPickManager"

export function activate(context: vscode.ExtensionContext) {
  console.log("Var Name extension is now active!")

  const translationProvider = new TranslationProvider()
  const quickPickManager = new QuickPickManager()

  const disposable = vscode.commands.registerCommand("var-name.translate", async () => {
    try {
      const input = await vscode.window.showInputBox({
        prompt: vscode.l10n.t("Enter text to translate"),
        placeHolder: vscode.l10n.t("Example: Show modal dialog"),
        validateInput: (text) => {
          console.log('text', text)
          if (!text || text.trim().length === 0) {
            return vscode.l10n.t("Please enter valid text")
          }
          return null
        },
      })

      if (!input) {
        return
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: vscode.l10n.t("Translating..."),
          cancellable: false,
        },
        async (progress) => {
          try {
            const translations = await translationProvider.translate(input.trim())

            // show select list
            await quickPickManager.showTranslations(translations)
          } catch (error) {
            vscode.window.showErrorMessage(vscode.l10n.t("Translation failed: {0}", error instanceof Error ? error.message : vscode.l10n.t("Unknown error")))
          }
        },
      )
    } catch (error) {
      vscode.window.showErrorMessage(vscode.l10n.t("Operation failed: {0}", error instanceof Error ? error.message : vscode.l10n.t("Unknown error")))
    }
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
