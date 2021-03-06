import * as vscode from 'vscode';
import { esac } from './helper/helper';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "easy-sass-autocompile" is now active!');
	esac.satusBar.init();

	// The command has been defined in the package.json file
	let disposable = vscode.commands.registerCommand('easy-sass-autocompile.info', () => {
		if (esac.compile != null){
			let ext = vscode.extensions.getExtension('brxmedia.easy-sass-autocompile');
			let ext_version = ext?.packageJSON.version;
			esac.message.systemMessage(" Version: " + ext_version + " - " + esac.compile.info.sassInfo + " - Sass Binary Path: " + esac.compile.info.sassBin, 'information', { modal: false });
		}
	});

	// The command has been defined in the package.json file
	let disposableDirty = vscode.commands.registerTextEditorCommand("easy-sass-autocompile.setDirty", esac.file.setDirty);

	// The command has been defined in the package.json file
	let didSaveEvent = vscode.workspace.onDidSaveTextDocument((document) => {
		if (esac.compile != null)
			esac.compile.onSave(document);
	});

	// Subscript to context events
	context.subscriptions.push(
		disposable,
		disposableDirty,
		didSaveEvent
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }