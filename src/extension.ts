import * as vscode from 'vscode';
import { esac } from './helper/helper';
import { Position, Range, TextEditor, TextEditorEdit } from 'vscode';


// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "easy-sass-autocompile" is now active!');
	esac.satusBar.init();

	// The command has been defined in the package.json file
	let disposable = vscode.commands.registerCommand('easy-sass-autocompile.info', () => {
		if (esac.compile != null)
			esac.message.systemMessage("" + esac.compile.info.sassInfo + " - Sass Binary Path: " + esac.compile.info.sassBin, 'information', { modal: false });
	});

	// The command has been defined in the package.json file
	let disposableDirty = vscode.commands.registerTextEditorCommand("easy-sass-autocompile.setDirty", esac.file.setDirty);

	// The command has been defined in the package.json file
	let didSaveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
		if (esac.compile != null)
			esac.compile.onSave(document);

		// let configuration = vscode.workspace.getConfiguration('easy-sass-autocompile');

		// let activeEditor = vscode.window.activeTextEditor;
		// if (activeEditor) {
		// 	let document = activeEditor.document;
		// 	if (document) {
		// 		if (compileHelper.instance != null) {
		// 			// check if the document is of typ sass or scss
		// 			if (fileHelper.instance.isSassOrScss(document)) {
		// 				compileHelper.instance.onSave(document);
		// 			}
		// 		}
		// 	}
		// }
	});

	context.subscriptions.push(
		disposable,
		didSaveEvent
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }