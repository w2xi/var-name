import * as vscode from "vscode"
import { TranslationProvider } from "./translationProvider"
import { QuickPickManager } from "./quickPickManager"

export function activate(context: vscode.ExtensionContext) {
  console.log("Var Name extension is now active!")

  const translationProvider = new TranslationProvider()
  const quickPickManager = new QuickPickManager()

  const disposable = vscode.commands.registerCommand("var-name.translate", async () => {
    try {
      // 显示输入框
      const input = await vscode.window.showInputBox({
        prompt: "请输入要翻译的中文",
        placeHolder: "例如：是否显示弹窗",
        validateInput: (text) => {
          console.log('text', text)
          if (!text || text.trim().length === 0) {
            return "请输入有效的中文文本"
          }
          return null
        },
      })

      if (!input) {
        return
      }

      // 显示加载状态
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "正在翻译...",
          cancellable: false,
        },
        async (progress) => {
          try {
            // 调用翻译服务
            const translations = await translationProvider.translate(input.trim())

            // 显示选择列表
            await quickPickManager.showTranslations(translations)
          } catch (error) {
            vscode.window.showErrorMessage(`翻译失败: ${error instanceof Error ? error.message : "未知错误"}`)
          }
        },
      )
    } catch (error) {
      vscode.window.showErrorMessage(`操作失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  })

  context.subscriptions.push(disposable)
}

export function deactivate() {}
