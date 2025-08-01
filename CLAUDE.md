# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

-   **Build the project**:
    ```bash
    npm run build
    ```
-   **Start the router server**:
    ```bash
    ccr start
    ```
-   **Stop the router server**:
    ```bash
    ccr stop
    ```
-   **Restart the router server**:
    ```bash
    ccr restart
    ```
-   **Check the server status**:
    ```bash
    ccr status
    ```
-   **Run Claude Code through the router**:
    ```bash
    ccr code "<your prompt>"
    ```
-   **Open the UI configuration interface**:
    ```bash
    ccr ui
    ```
-   **Release a new version**:
    ```bash
    npm run release
    ```

## Architecture

This project is a TypeScript-based router for Claude Code requests. It allows routing requests to different large language models (LLMs) from various providers based on custom rules.

-   **Entry Point**: The main command-line interface logic is in `src/cli.ts`. It handles parsing commands like `start`, `stop`, and `code`.
-   **Server**: The `ccr start` command launches a server that listens for requests from Claude Code. The server logic is initiated from `src/index.ts`.
-   **Configuration**: The router is configured via a JSON file located at `~/.claude-code-router/config.json`. This file defines API providers, routing rules, and custom transformers. An example can be found in `config.example.json`.
-   **Routing**: The core routing logic determines which LLM provider and model to use for a given request. It supports default routes for different scenarios (`default`, `background`, `think`, `longContext`, `webSearch`) and can be extended with a custom JavaScript router file. The router logic is likely in `src/utils/router.ts`.
-   **Providers and Transformers**: The application supports multiple LLM providers. Transformers adapt the request and response formats for different provider APIs.
-   **Claude Code Integration**: When a user runs `ccr code`, the command is forwarded to the running router service. The service then processes the request, applies routing rules, and sends it to the configured LLM. If the service isn't running, `ccr code` will attempt to start it automatically.
-   **Dependencies**: The project is built with `esbuild`. It has a key local dependency `@musistudio/llms`, which probably contains the core logic for interacting with different LLM APIs.
-   `@musistudio/llms` is implemented based on `fastify` and exposes `fastify`'s hook and middleware interfaces, allowing direct use of `server.addHook`.

## UI Frontend

The project includes a web-based UI for configuration management:

-   **Tech Stack**: React + TypeScript + Vite with Tailwind CSS and shadcn-ui components
-   **Build**: Uses `vite-plugin-singlefile` to create a single, self-contained HTML file
-   **Commands**:
    -   `cd ui && pnpm dev` - Run development server
    -   `cd ui && pnpm build` - Build production HTML file
    -   `cd ui && pnpm lint` - Lint files
-   **Features**: English/Chinese i18n support, configuration editing interface
-   **Location**: Frontend code is in the `ui/` directory

## Provider Support

The router supports multiple LLM providers with built-in transformers:

-   **OpenRouter**: anthropic/claude models, google/gemini models
-   **DeepSeek**: deepseek-chat, deepseek-reasoner
-   **Ollama**: Local models like qwen2.5-coder
-   **Gemini**: Google's gemini models via direct API
-   **ModelScope**: Qwen models including Qwen3-Coder and thinking models
-   **DashScope**: Alibaba's model service
-   **Volcengine**: ByteDance's model service
-   **Custom Providers**: Support for any OpenAI-compatible API

## Built-in Transformers

-   `anthropic`: Direct Anthropic API compatibility
-   `deepseek`: DeepSeek API adaptations
-   `gemini`: Google Gemini API format
-   `openrouter`: OpenRouter API compatibility
-   `maxtoken`: Set specific max_tokens limits
-   `tooluse`: Optimize tool usage with tool_choice
-   `reasoning`: Handle reasoning_content fields
-   `enhancetool`: Add error tolerance to tool calls
-   `sampling`: Process temperature, top_p, top_k parameters
-   `cleancache`: Remove cache_control fields

## Security Considerations

Based on security analysis in `plans/security-improvements.md`:

-   **API Key Protection**: Avoid exposing configuration with sensitive data
-   **Environment Variables**: Don't copy all config to process.env
-   **Authentication**: Use APIKEY for server authentication when configured
-   **Host Binding**: Defaults to 127.0.0.1 unless APIKEY is set for security

## GitHub Actions Integration

The router can be integrated into CI/CD workflows:

-   Install via: `bunx @musistudio/claude-code-router@latest start`
-   Configure with environment variables or config file
-   Use with `ANTHROPIC_BASE_URL: http://localhost:3456`
-   Supports background task routing for cost optimization