# Claude Code Launcher 开发记录

## 关键问题记录

### Windows 终端启动问题

1. **必须弹出新窗口** - 使用 `spawn` 时需要注意：
   - `windowsHide: false` 仅控制父进程窗口是否隐藏
   - 要弹出新窗口，必须使用 `start` 命令或 `Start-Process`
   - `stdio` 不能设置为 `'ignore'` 否则可能阻塞

2. **环境变量继承** - 需要显式传递 `env: process.env`

3. **命令格式** - Windows 下不同终端：
   - CMD: `start "" cmd /k "cd /d 路径 && 命令"`
   - PowerShell: `Start-Process powershell -ArgumentList '-NoExit','-Command "cd 路径; 命令"'`

4. **shell 模式** - Windows 下建议使用 `shell: true` 或指定 `shell: 'cmd.exe'` / `shell: 'powershell.exe'`

## 发布流程

### VS Code 扩展发布步骤

1. **版本更新** - 修改 `package.json` 中的 `version` 字段
2. **提交代码** - `git add -A && git commit -m "release: vx.x.x"`
3. **编译打包** - `npm run compile && npx vsce package`
4. **推送代码** - `git push origin master`
5. **创建 Release** - 使用 `gh release create` 命令并上传 `.vsix` 文件

### GitHub CLI 认证

- 首次使用需要运行 `gh auth login`
- 或设置环境变量 `GH_TOKEN`

### vsce 打包注意事项

- 会自动执行 `vscode:prepublish` 脚本
- 生成的 `.vsix` 文件可直接在 VS Code 中通过 "Install from VSIX" 安装
