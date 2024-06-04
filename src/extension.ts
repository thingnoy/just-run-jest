import * as vscode from 'vscode';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('just-run-jest.run', () => {
    const document = vscode.window.activeTextEditor?.document;
    if (!document) return;

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const testFilePath = workspaceFolder
      ? document.fileName.replace(workspaceFolder.uri.fsPath, '').replace(/^\//, '')
      : document.fileName;

    const testFileExtension = document.fileName.match(/\.([tj]sx?)$/)?.[0] || '.js';
    const testFileFolder = testFilePath.replace(/[^/]*$/, '');

    let collectFromPath = testFilePath.replace(/\.(spec|test)\.[tj]sx?$/, testFileExtension);
    const fullPath = workspaceFolder ? `${workspaceFolder.uri.fsPath}/${collectFromPath}` : collectFromPath;
    if (!fs.existsSync(fullPath)) {
      collectFromPath = `${testFileFolder}index${testFileExtension}`;
    }

    const terminal =
      vscode.window.terminals.find((item) => item.name === 'jest-coverage') ||
      vscode.window.createTerminal('jest-coverage');

    const { runCommand } = vscode.workspace.getConfiguration('just-run-jest');
    const command = (
      runCommand || `node_modules/.bin/jest "$testFile" --silent --coverage --collectCoverageFrom="$collectFrom"`
    )
      .replace('$testFile', testFilePath)
      .replace('$collectFrom', collectFromPath);

    terminal.show();
    terminal.sendText(command);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
