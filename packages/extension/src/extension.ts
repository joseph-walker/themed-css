import * as vscode from 'vscode';
import { compile, fold, executeContracts, buildCssTree, type Contract } from '@theme-contracts/compiler';

const knownContracts = new Map<string, Contract[]>();
const executedContracts = new Map<string, ReturnType<typeof executeContracts>>();

export async function activate(context: vscode.ExtensionContext) {
	const cssFiles = await vscode.workspace.findFiles('**/*.module.css');
	const themeFiles = await vscode.workspace.findFiles('**/themes/*.css');

	for (const file of cssFiles) {
		const src = await vscode.workspace.openTextDocument(file);
		const contracts = compile(src.getText());

		knownContracts.set(file.toString(), contracts);
	}

	const compiledContracts = [...knownContracts.values()].flat(1).flatMap(fold);

	for (const file of themeFiles) {
		const src = await vscode.workspace.openTextDocument(file);
		const executed = executeContracts(compiledContracts, buildCssTree(src.getText()));

		executedContracts.set(file.toString(), executed);
	}

	vscode.languages.registerHoverProvider("css", {
		provideHover(document, position, _token) {
			const documentKey = document.uri.toString();

			if (!knownContracts.has(documentKey)) {
				return;
			} else {
				const relevantContracts = knownContracts.get(documentKey);
				const identifier = document.getText(
					document.getWordRangeAtPosition(position)
				);

				const compiledContract = Object.fromEntries(
					relevantContracts?.flatMap(fold) ?? []
				);

				if (!(identifier in compiledContract)) {
					return;
				}

				let markdown = `
__Theme values__ for \`${identifier}\`:
`;

				for (const [theme, variables] of executedContracts) {
					const themeName = theme.split("/").pop();

					markdown += `
_${themeName}_: \`${variables[identifier].value}\`
`;
				}

				return new vscode.Hover(markdown);
			}
		},
	});
}

export function deactivate() {}
