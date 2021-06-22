import * as vscode from 'vscode';
import { helper } from './helper';
import { fileHelper } from './fileHelper';
import { compileHelper } from './compileHelper';


// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "easy-sass-autocompile" is now active!');
	helper.statusBarUi.init();

	// The command has been defined in the package.json file
	let disposable = vscode.commands.registerCommand('easy-sass-autocompile.info', () => {
		if (compileHelper.instance != null)
			helper.systemMessage("" + compileHelper.instance.info.sassInfo + " - Sass Binary Path: " + compileHelper.instance.info.sassBin, 'information', {modal: false});
	});

	// The command has been defined in the package.json file
	let didSaveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
		let configuration = vscode.workspace.getConfiguration('easy-sass-autocompile');

		let activeEditor = vscode.window.activeTextEditor;
		if (activeEditor) {
			let document = activeEditor.document;
			if (document) {
				if (compileHelper.instance != null) {
					// check if the document is of typ sass or scss
					if (fileHelper.instance.isSassOrScss(document)) {
						compileHelper.instance.onSave(document);
					}
				}
			}
		}
	});

	context.subscriptions.push(
		disposable,
		didSaveEvent
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
