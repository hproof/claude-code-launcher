import * as vscode from 'vscode';

// 存储目录与终端的映射关系
const terminalMap = new Map<string, vscode.Terminal>();

export function activate(context: vscode.ExtensionContext) {
    // 注册命令
    const disposable = vscode.commands.registerCommand('claude-code-launcher.launch', () => {
        launchClaudeCode();
    });

    context.subscriptions.push(disposable);

    // 监听终端关闭事件，清理映射关系
    vscode.window.onDidCloseTerminal((terminal) => {
        for (const [dir, term] of terminalMap.entries()) {
            if (term === terminal) {
                terminalMap.delete(dir);
                break;
            }
        }
    });
}

function launchClaudeCode() {
    // 获取当前工作目录
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('没有打开的工作区');
        return;
    }

    const currentDir = workspaceFolders[0].uri.fsPath;

    // 检查当前目录是否已有打开的终端
    const existingTerminal = terminalMap.get(currentDir);
    if (existingTerminal) {
        // 如果终端还存在（未关闭），切换到前台
        const stillExists = vscode.window.terminals.some(t => t === existingTerminal);
        if (stillExists) {
            existingTerminal.show();
            return;
        } else {
            // 终端已关闭，从映射中移除
            terminalMap.delete(currentDir);
        }
    }

    // 获取配置
    const config = vscode.workspace.getConfiguration('claudeCodeLauncher');
    const terminalType = config.get<string>('terminalType', 'powershell');
    const commandArgs = config.get<string>('commandArgs', '');

    // 构建命令
    const command = `claude ${commandArgs}`.trim();

    // 创建终端选项
    const terminalOptions: vscode.TerminalOptions = {
        name: `Claude Code - ${workspaceFolders[0].name}`,
        cwd: currentDir
    };

    // 根据配置设置 shell
    if (terminalType === 'powershell') {
        terminalOptions.shellPath = getPowerShellPath();
    } else if (terminalType === 'cmd') {
        terminalOptions.shellPath = 'cmd.exe';
    }
    // default 时不设置 shellPath，使用 VS Code 默认终端

    // 创建终端
    const terminal = vscode.window.createTerminal(terminalOptions);

    // 发送命令
    terminal.sendText(command);

    // 显示终端
    terminal.show();

    // 记录映射关系
    terminalMap.set(currentDir, terminal);
}

function getPowerShellPath(): string {
    // Windows 上尝试使用 PowerShell Core 或 Windows PowerShell
    if (process.platform === 'win32') {
        // 优先使用 PowerShell Core (pwsh)，如果不存在则使用 Windows PowerShell
        return 'powershell.exe';
    }
    return 'pwsh';
}

export function deactivate() {
    // 清理所有终端映射
    terminalMap.clear();
}
