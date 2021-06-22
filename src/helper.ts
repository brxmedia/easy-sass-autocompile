import { PRIORITY_BELOW_NORMAL } from 'constants';
import * as vscode from 'vscode';


export class helper {
    public static systemMessage(text: string = '', type: string = 'success') {
        let pre = "Sass Autocompile - ";
        text = pre + text;

        switch (type) {
            case 'warning':
                
                break;

            case 'information':
                vscode.window.showInformationMessage(text);
                break;

            case 'error':
                vscode.window.showErrorMessage(text);
                vscode.window.setStatusBarMessage(pre + 'Error', 15000);
                break;

            case 'status':
                vscode.window.setStatusBarMessage(text, 15000);
                break;

            default:
                vscode.window.showInformationMessage(text);
                break;
        }
    }
}