# Qwen Code Router

This project allows you to use Qwen models with Claude Code, routing requests to Qwen providers instead of (or in addition to) Anthropic's Claude models.

## ✨ Features

- **Model Routing**: Route requests to different Qwen models based on your needs (e.g., background tasks, thinking, long context).
- **Multi-Provider Support**: Supports various Qwen model providers like ModelScope, DashScope, and others.
- **Request/Response Transformation**: Customize requests and responses for Qwen providers using transformers.
- **Dynamic Model Switching**: Switch Qwen models on-the-fly within Claude Code using the `/model` command.
- **GitHub Actions Integration**: Trigger Qwen-powered tasks in your GitHub workflows.
- **Plugin System**: Extend functionality with custom transformers for Qwen models.

## 🚀 Getting Started with Qwen

### 1. Installation

First, ensure you have [Claude Code](https://docs.anthropic.com/en/docs/claude-code/quickstart) installed:

```shell
npm install -g @anthropic-ai/claude-code
```

Then, install Claude Code Router:

```shell
npm install -g @musistudio/claude-code-router
```

### 2. Configuration for Qwen

Create and configure your `~/.claude-code-router/config.json` file with Qwen providers. Here's an example configuration:

```json
{
  "APIKEY": "your-secret-key",
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "Providers": [
    {
      "name": "modelscope",
      "api_base_url": "https://api-inference.modelscope.cn/v1/chat/completions",
      "api_key": "your-modelscope-api-key",
      "models": ["Qwen/Qwen3-Coder-480B-A35B-Instruct", "Qwen/Qwen3-235B-A22B-Thinking-2507"],
      "transformer": {
        "use": [
          ["maxtoken", { "max_tokens": 65536 }],
          "enhancetool"
        ],
        "Qwen/Qwen3-235B-A22B-Thinking-2507": {
          "use": ["reasoning"]
        }
      }
    },
    {
      "name": "dashscope",
      "api_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
      "api_key": "your-dashscope-api-key",
      "models": ["qwen3-coder-plus"],
      "transformer": {
        "use": [
          ["maxtoken", { "max_tokens": 65536 }],
          "enhancetool"
        ]
      }
    }
  ],
  "Router": {
    "default": "modelscope,Qwen/Qwen3-Coder-480B-A35B-Instruct",
    "background": "dashscope,qwen3-coder-plus",
    "think": "modelscope,Qwen/Qwen3-235B-A22B-Thinking-2507",
    "longContext": "modelscope,Qwen/Qwen3-Coder-480B-A35B-Instruct",
    "longContextThreshold": 60000
  }
}
```

### 3. Running Claude Code with Qwen Router

Start Claude Code using the router:

```shell
ccr code
```

> **Note**: After modifying the configuration file, you need to restart the service for the changes to take effect:
>
> ```shell
> ccr restart
> ```

### 4. UI Mode (Beta)

For a more intuitive experience, you can use the UI mode to manage your Qwen configuration:

```shell
ccr ui
```

This will open a web-based interface where you can easily view and edit your `config.json` file.

## 🤖 Qwen Transformers

When using Qwen models, you may need specific transformers to ensure compatibility:

- `maxtoken`: Sets a specific `max_tokens` value for Qwen models.
- `enhancetool`: Adds error tolerance to tool call parameters returned by Qwen models.
- `reasoning`: Used to process the `reasoning_content` field in Qwen's thinking models.

## 📝 Further Reading

- [Project Motivation and How It Works](blog/en/project-motivation-and-how-it-works.md)
- [Maybe We Can Do More with the Router](blog/en/maybe-we-can-do-more-with-the-route.md)

## ❤️ Support & Sponsoring

If you find this project helpful, please consider sponsoring its development. Your support is greatly appreciated!

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/F1F31GN2GM)