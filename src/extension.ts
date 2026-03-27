import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

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

    // 获取 Python venv 配置
    const venvEnabled = config.get<boolean>('pythonVenvEnabled', true);
    const venvDir = config.get<string>('pythonVenvDirectory', './venv');

    // 计算 venv 激活命令
    const venvCommand = getVenvActivationCommand(currentDir, venvEnabled, venvDir, config);

    if (terminalMode === 'external') {
        launchExternalTerminal(currentDir, command, venvCommand, config);
    } else {
        launchIntegratedTerminal(currentDir, command, venvCommand);
    }
}

function getVenvActivationCommand(cwd: string, venvEnabled: boolean, venvDir: string, config: vscode.WorkspaceConfiguration): string | null {
    if (!venvEnabled) {
        return null;
    }

    // 解析 venv 路径（支持相对路径和绝对路径）
    const resolvedVenvDir = path.isAbsolute(venvDir)
        ? venvDir
        : path.join(cwd, venvDir);

    const terminalType = config.get<string>('externalTerminal', 'powershell');

    let activateScript: string;
    if (terminalType === 'cmd') {
        activateScript = path.join(resolvedVenvDir, 'Scripts', 'activate.bat');
    } else {
        // PowerShell 使用 Activate.ps1（大写 A）
        activateScript = path.join(resolvedVenvDir, 'Scripts', 'Activate.ps1');
    }

    // 检查激活脚本是否存在
    if (fs.existsSync(activateScript)) {
        if (terminalType === 'cmd') {
            return `call "${activateScript}"`;
        } else {
            return `. "${activateScript}"`;
        }
    }

    return null;
}

function buildCommandWithVenv(command: string, venvCommand: string | null, terminalType: string): string {
    if (!venvCommand) {
        return command;
    }
    // PowerShell 5.x 不支持 &&，使用 ; 代替
    const separator = terminalType === 'powershell' ? ' ; ' : ' && ';
    return `${venvCommand}${separator}${command}`;
}

function launchExternalTerminal(cwd: string, command: string, venvCommand: string | null, config: vscode.WorkspaceConfiguration) {
    const terminalType = config.get<string>('externalTerminal', 'powershell');
    const fullCommand = buildCommandWithVenv(command, venvCommand, terminalType);

    let execCommand: string;

    if (terminalType === 'cmd') {
        // CMD: 使用 start 命令弹出新窗口
        // 注意: start 后面第一个参数是窗口标题（必需）
        const escapedCwd = cwd.replace(/"/g, '""');
        execCommand = `start "Claude Code" cmd /k "cd /d "${escapedCwd}" && ${fullCommand}"`;
    } else {
        // PowerShell: 使用 start 命令弹出新窗口
        // 使用单引号包裹路径，避免转义问题
        const escapedCwd = cwd.replace(/'/g, "''");
        execCommand = `start "Claude Code" powershell -NoExit -Command "cd '${escapedCwd}'; ${fullCommand}"`;
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

function launchIntegratedTerminal(cwd: string, command: string, venvCommand: string | null) {
    const terminal = vscode.window.createTerminal({
        name: 'Claude Code',
        cwd: cwd
    });

    if (venvCommand) {
        terminal.sendText(venvCommand);
    }
    terminal.sendText(command);
    terminal.show();
}

export function deactivate() {
    // 无需清理
}
