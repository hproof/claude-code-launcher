# Claude Code Launcher

在 VS Code 中快速启动 Claude Code 的插件。

## 功能

- 通过命令面板快速启动 Claude Code
- **支持独立的外部终端窗口**（脱离 VS Code，每次执行都打开新窗口）
- 支持内置终端模式
- 可配置启动命令和参数

## 使用方法

1. 打开 VS Code 命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`）
2. 输入并执行 `Launch Claude Code`
3. 插件会在**独立的系统终端窗口**中启动 Claude Code

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `claudeCodeLauncher.terminalMode` | string | `external` | 终端模式：`external`（外部独立窗口，默认）、`integrated`（VS Code 内置终端） |
| `claudeCodeLauncher.externalTerminal` | string | `auto` | 外部终端类型：`auto`（自动检测）、`cmd`、`powershell`、`wt`（Windows Terminal）、`gnome`、`konsole`、`xterm` |
| `claudeCodeLauncher.command` | string | `claude` | 启动命令，可包含参数和路径，例如 `claude`、`claude.exe -c`、`d:/myself/claude.exe -c` |

## 配置示例

### 默认配置（Windows 外部终端，自动检测）

无需配置，安装即用。插件会自动使用 Windows Terminal（如果已安装）或 PowerShell。

### 使用 CMD 作为外部终端

```json
{
  "claudeCodeLauncher.externalTerminal": "cmd"
}
```

### 使用 Claude Code 的 Continue 模式

```json
{
  "claudeCodeLauncher.command": "claude -c"
}
```

### 使用自定义路径的 Claude

```json
{
  "claudeCodeLauncher.command": "d:/tools/claude.exe -c"
}
```

### 使用 VS Code 内置终端

```json
{
  "claudeCodeLauncher.terminalMode": "integrated"
}
```

### 完整配置示例

```json
{
  "claudeCodeLauncher.terminalMode": "external",
  "claudeCodeLauncher.externalTerminal": "wt",
  "claudeCodeLauncher.command": "claude"
}
```

## 安装

### 本地安装

1. 克隆或下载此项目
2. 在项目目录中运行：
   ```bash
   npm install
   npm run compile
   ```
3. 按 `F5` 启动调试，或打包成 `.vsix` 文件安装

### 打包安装

```bash
npm install -g @vscode/vsce
vsce package
```

然后在 VS Code 中通过 "从 VSIX 安装" 安装生成的 `.vsix` 文件。

## 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 监听模式
npm run watch

# 调试
按 F5 启动调试窗口
```

## 要求

- VS Code 1.74.0 或更高版本
- 已安装 Claude Code CLI

## License

MIT
