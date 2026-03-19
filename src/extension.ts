import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('claude-code-launcher.launch', () => {
        launchClaudeCode();
    });

    context.subscriptions.push(disposable);
}

function launchClaudeCode() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('没有打开的工作区');
        return;
    }

    const currentDir = workspaceFolders[0].uri.fsPath;
    const config = vscode.workspace.getConfiguration('claudeCodeLauncher');
    const terminalMode = config.get<string>('terminalMode', 'external');
    const command = config.get<string>('command', 'claude').trim();

    if (terminalMode === 'external') {
        launchExternalTerminal(currentDir, command, config);
    } else {
        launchIntegratedTerminal(currentDir, command);
    }
}

function launchExternalTerminal(cwd: string, command: string, config: vscode.WorkspaceConfiguration) {
    const terminalType = config.get<string>('externalTerminal', 'powershell');

    let execCommand: string;

    if (terminalType === 'cmd') {
        // CMD: 使用 start 命令弹出新窗口
        // 注意: start 后面第一个参数是窗口标题（必需）
        const escapedCwd = cwd.replace(/"/g, '""');
        execCommand = `start "Claude Code" cmd /k "cd /d "${escapedCwd}" && ${command}"`;
    } else {
        // PowerShell: 使用 start 命令弹出新窗口
        // 使用单引号包裹路径，避免转义问题
        const escapedCwd = cwd.replace(/'/g, "''");
        execCommand = `start "Claude Code" powershell -NoExit -Command "cd '${escapedCwd}'; ${command}"`;
    }

    // 使用 exec 执行命令，继承环境变量
    const child = exec(execCommand, {
        env: process.env,
        windowsHide: false
    }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`启动终端失败: ${error.message}`);
        }
    });

    // 忽略错误，让进程独立运行
    child.on('error', () => {
        // 错误已在回调中处理
    });
}

function launchIntegratedTerminal(cwd: string, command: string) {
    const terminal = vscode.window.createTerminal({
        name: 'Claude Code',
        cwd: cwd
    });

    terminal.sendText(command);
    terminal.show();
}

export function deactivate() {
    // 无需清理
}
