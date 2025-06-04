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
      provider: config.get<string>("provider", ""),
      apiKey: config.get<string>("apiKey", ""),
      baseUrl: config.get<string>("baseUrl", ""),
      model: config.get<string>("model", ""),
    }
  }

  private getApiUrl(provider: string, baseUrl?: string): string {
    if (baseUrl) {
      return baseUrl
    }

    switch (provider) {
      case "openai":
        return "https://api.openai.com/v1/chat/completions"
      case "deepseek":
        return "https://api.deepseek.com/v1/chat/completions"
      case "qwen":
        return "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
      default:
        return "https://api.openai.com/v1/chat/completions"
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
      throw new Error("请先在设置中配置API Key")
    }

    const apiUrl = this.getApiUrl(config.provider, config.baseUrl)
    const prompt = this.createPrompt(text)

    try {
      const response = await axios.post(
        apiUrl,
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

      // 尝试解析JSON响应
      try {
        const result = JSON.parse(content)

        // 验证返回的数据格式
        const requiredKeys = ["camelCase", "PascalCase", "snake_case", "CONSTANT_CASE", "kebab-case"]
        for (const key of requiredKeys) {
          if (!result[key]) {
            throw new Error(`缺少必需的字段: ${key}`)
          }
        }

        return result as TranslationResult
      } catch (parseError) {
        // 如果JSON解析失败，尝试从文本中提取
        return this.fallbackParse(content, text)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error("API Key 无效，请检查配置")
        } else if (error.response?.status === 429) {
          throw new Error("API 调用频率超限，请稍后重试")
        } else if (error.code === "ECONNABORTED") {
          throw new Error("请求超时，请检查网络连接")
        } else {
          throw new Error(`API 调用失败: ${error.response?.data?.error?.message || error.message}`)
        }
      }
      throw error
    }
  }

  private fallbackParse(content: string, originalText: string): TranslationResult {
    // 简单的后备解析逻辑
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
    // 简单的中英文映射（实际项目中可以扩展）
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
