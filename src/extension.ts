import * as vscode from "vscode";
const fs = require('fs');

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("just-run-jest.run", () => {
		const document = vscode.window.activeTextEditor?.document;
		if (!document) return;

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		const testFileExtension = document.fileName.match(/\.([tj]sx?)$/)?.[0] || ".js";
		const testFilePath = workspaceFolder
			? document.fileName.replace(workspaceFolder.uri.fsPath, "")
			: document.fileName;

		let collectFromPath = testFilePath.replace(/\.(spec|test)\.[tj]sx?$/, testFileExtension);

		const fullPath = workspaceFolder
			? `${workspaceFolder.uri.fsPath}/${collectFromPath}`
			: collectFromPath;

		if (!fs.existsSync(fullPath)) {
			collectFromPath = `index${testFileExtension}`;
		}

		const terminal = vscode.window.terminals.find(item => item.name === "jest-coverage")
			|| vscode.window.createTerminal("jest-coverage");

		const { runCommand } = vscode.workspace.getConfiguration("just-run-jest");

		const command = runCommand
			? runCommand.replace('$testFile', testFilePath).replace('$collectFrom', collectFromPath)
			: `node_modules/.bin/jest ${testFilePath} --silent --coverage --collectCoverageFrom="${collectFromPath}"`;

		terminal.show();
		terminal.sendText(command);
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
