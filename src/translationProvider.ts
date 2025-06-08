import * as vscode from "vscode"
import axios from "axios"

export interface TranslationResult {
  camelCase: string
  PascalCase: string
  snake_case: string
  CONSTANT_CASE: string
  "kebab-case": string
}

export class TranslationProvider {
  private getConfig() {
    const config = vscode.workspace.getConfiguration("var-name")
    return {
      apiKey: config.get<string>("apiKey", ""),
      baseURL: config.get<string>("baseURL", ""),
      model: config.get<string>("model", ""),
    }
  }

  private createPrompt(text: string): string {
    return `请将以下中文翻译成英文，并提供5种编程语言变量命名格式。请严格按照以下JSON格式返回，不要包含任何其他文字：

{
  "camelCase": "驼峰命名法",
  "PascalCase": "帕斯卡命名法", 
  "snake_case": "下划线命名法",
  "CONSTANT_CASE": "常量命名法",
  "kebab-case": "短横线命名法"
}

中文文本：${text}

示例：
输入：是否显示弹窗
输出：
{
  "camelCase": "isShowModal",
  "PascalCase": "IsShowModal",
  "snake_case": "is_show_modal", 
  "CONSTANT_CASE": "IS_SHOW_MODAL",
  "kebab-case": "is-show-modal"
}`
  }

  async translate(text: string): Promise<TranslationResult> {
    const config = this.getConfig()

    if (!config.apiKey) {
      throw new Error(vscode.l10n.t("Please configure API Key in settings first"))
    }
    
    if (!config.baseURL) {
      throw new Error(vscode.l10n.t("Please configure Base URL in settings first"))
    }

    const prompt = this.createPrompt(text)

    try {
      const response = await axios.post(
        config.baseURL,
        {
          model: config.model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
          enable_thinking: false,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        },
      )

      const content = response.data.choices[0].message.content.trim()

      // try to parse JSON response
      try {
        const result = JSON.parse(content)

        // validate the return data format
        const requiredKeys = ["camelCase", "PascalCase", "snake_case", "CONSTANT_CASE", "kebab-case"]
        for (const key of requiredKeys) {
          if (!result[key]) {
            throw new Error(vscode.l10n.t("Missing required field: {0}", key))
          }
        }

        return result as TranslationResult
      } catch (parseError) {
        // if JSON parsing failed, try to extract from text
        return this.fallbackParse(content, text)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error(vscode.l10n.t("Invalid API Key, please check your configuration"))
        } else if (error.response?.status === 429) {
          throw new Error(vscode.l10n.t("API rate limit exceeded, please try again later"))
        } else if (error.code === "ECONNABORTED") {
          throw new Error(vscode.l10n.t("Request timeout, please check your network connection"))
        } else {
          throw new Error(vscode.l10n.t("API call failed: {0}", error.response?.data?.error?.message || error.message))
        }
      }
      throw error
    }
  }

  private fallbackParse(content: string, originalText: string): TranslationResult {
    // simple fallback parsing logic
    const englishText = this.simpleTranslate(originalText)

    return {
      camelCase: this.toCamelCase(englishText),
      PascalCase: this.toPascalCase(englishText),
      snake_case: this.toSnakeCase(englishText),
      CONSTANT_CASE: this.toConstantCase(englishText),
      "kebab-case": this.toKebabCase(englishText),
    }
  }

  private simpleTranslate(text: string): string {
    // simple Chinese-English mapping (can be extended in actual projects)
    const mapping: { [key: string]: string } = {
      是否: "is",
      显示: "show",
      弹窗: "modal",
      用户: "user",
      名称: "name",
      密码: "password",
      登录: "login",
      注册: "register",
      提交: "submit",
      取消: "cancel",
      确认: "confirm",
      删除: "delete",
      编辑: "edit",
      保存: "save",
      加载: "loading",
      数据: "data",
      列表: "list",
      详情: "detail",
      设置: "setting",
    }

    let result = text
    for (const [chinese, english] of Object.entries(mapping)) {
      result = result.replace(new RegExp(chinese, "g"), english)
    }

    return result.replace(/[^\w\s]/g, "").trim() || "variable"
  }

  private toCamelCase(text: string): string {
    return text
      .split(/\s+/)
      .map((word, index) =>
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("")
  }

  private toPascalCase(text: string): string {
    return text
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("")
  }

  private toSnakeCase(text: string): string {
    return text
      .split(/\s+/)
      .map((word) => word.toLowerCase())
      .join("_")
  }

  private toConstantCase(text: string): string {
    return text
      .split(/\s+/)
      .map((word) => word.toUpperCase())
      .join("_")
  }

  private toKebabCase(text: string): string {
    return text
      .split(/\s+/)
      .map((word) => word.toLowerCase())
      .join("-")
  }
}
