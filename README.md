# Claude Code Launcher

在 VS Code 中快速启动 Claude Code 的插件。

## 功能

- 通过命令面板快速启动 Claude Code
- 智能复用终端：同一工作目录只会打开一个终端，避免重复创建
- 支持配置终端类型和命令参数

## 使用方法

1. 打开 VS Code 命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`）
2. 输入并执行 `Launch Claude Code`
3. 插件会在终端中启动 Claude Code

## 配置项

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `claudeCodeLauncher.terminalType` | string | `powershell` | 终端类型：`default`（默认）、`cmd`、`powershell` |
| `claudeCodeLauncher.commandArgs` | string | `""` | Claude Code 命令参数，例如 `-c` |

## 配置示例

在 VS Code 设置中添加：

```json
{
  "claudeCodeLauncher.terminalType": "cmd",
  "claudeCodeLauncher.commandArgs": "-c"
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
npm install -g vsce
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
