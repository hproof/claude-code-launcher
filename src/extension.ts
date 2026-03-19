import * as vscode from 'vscode';
import { spawn } from 'child_process';

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
    const platform = process.platform;
    const externalTerminal = config.get<string>('externalTerminal', 'auto');

    let shellCmd: string;
    let shellArgs: string[];

    if (platform === 'win32') {
        // Windows 平台
        const terminal = externalTerminal === 'auto' ? detectWindowsTerminal() : externalTerminal;
        const escapedCommand = command.replace(/"/g, '\\"');

        switch (terminal) {
            case 'wt':
                // Windows Terminal
                shellCmd = 'wt.exe';
                shellArgs = ['-d', cwd, 'powershell.exe', '-Command', command];
                break;
            case 'powershell':
                shellCmd = 'powershell.exe';
                shellArgs = ['-Command', `Start-Process powershell -ArgumentList '-NoExit','-Command "cd \\"${cwd}\\"; ${escapedCommand}"'`];
                break;
            case 'cmd':
            default:
                shellCmd = 'cmd.exe';
                shellArgs = ['/c', 'start', 'cmd', '/k', `cd /d "${cwd}" && ${command}`];
                break;
        }
    } else if (platform === 'darwin') {
        // macOS
        shellCmd = 'osascript';
        shellArgs = ['-e', `tell application "Terminal" to do script "cd \\"${cwd}\\" && ${command}"`];
    } else {
        // Linux 平台
        const terminal = externalTerminal === 'auto' ? detectLinuxTerminal() : externalTerminal;
        shellCmd = terminal;

        switch (terminal) {
            case 'gnome-terminal':
                shellArgs = ['--working-directory', cwd, '--', 'bash', '-c', `${command}; exec bash`];
                break;
            case 'konsole':
                shellArgs = ['--workdir', cwd, '-e', 'bash', '-c', `${command}; exec bash`];
                break;
            case 'xterm':
            default:
                shellArgs = ['-e', 'bash', '-c', `cd "${cwd}" && ${command}; exec bash`];
                break;
        }
    }

    // 启动外部终端
    const child = spawn(shellCmd, shellArgs, {
        detached: true,
        stdio: 'ignore',
        windowsHide: false
    });

    child.on('error', (err) => {
        vscode.window.showErrorMessage(`启动终端失败: ${err.message}`);
    });

    // 忽略子进程，让它独立运行
    child.unref();
}

function launchIntegratedTerminal(cwd: string, command: string) {
    const terminal = vscode.window.createTerminal({
        name: 'Claude Code',
        cwd: cwd
    });

    terminal.sendText(command);
    terminal.show();
}

function detectWindowsTerminal(): string {
    // 优先尝试 Windows Terminal
    try {
        // 检查 wt.exe 是否存在
        const { execSync } = require('child_process');
        execSync('where wt.exe', { stdio: 'ignore' });
        return 'wt';
    } catch {
        // 回退到 powershell
        return 'powershell';
    }
}

function detectLinuxTerminal(): string {
    // 按优先级检测 Linux 终端
    const { execSync } = require('child_process');
    const terminals = ['gnome-terminal', 'konsole', 'xterm'];

    for (const term of terminals) {
        try {
            execSync(`which ${term}`, { stdio: 'ignore' });
            return term;
        } catch {
            continue;
        }
    }

    return 'xterm';
}

export function deactivate() {
    // 无需清理
}
