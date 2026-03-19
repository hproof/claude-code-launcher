# Change Log

## [1.0.0] - 2024-03-19

### 功能

- 添加 `Launch Claude Code` 命令
- **默认使用独立外部终端窗口**：每次执行命令都会在系统终端中打开全新窗口
- **支持 `terminalMode` 配置**：可选择 `external`（外部独立窗口，默认）或 `integrated`（VS Code 内置终端）
- **支持 `externalTerminal` 配置**：指定外部终端类型（auto/cmd/powershell/wt/gnome/konsole/xterm）
- **支持 `command` 配置**：可自定义启动命令，包含参数和路径，例如 `claude`、`claude.exe -c`、`d:/myself/claude.exe -c`
