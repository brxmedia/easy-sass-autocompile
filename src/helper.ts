import * as vscode from 'vscode';
import { statusBarUi } from './satusBarUi';

export class helper {
    private static _msgChannel: vscode.OutputChannel;
    private static _prefix: string = "Sass Autocompile - ";
    private static _msgCache: string[];

    private static get prefix() {
        return helper._prefix;
    }

    private static get msgChannel() {
        if (!helper._msgChannel) {
            helper._msgChannel = vscode.window.createOutputChannel('Easy Sass Autocompiler');
        }
        return helper._msgChannel;
    }

    private static get msgCache() {
        return helper._msgCache;
    }
    private static set msgCache(value) {
        helper._msgCache = value;
    }

    public static get statusBarUi() {
        return statusBarUi;
    }

    public static systemMessage(text: string = '', type: string = 'success', options: vscode.MessageOptions = {}) {
        text = helper.prefix + text;

        switch (type) {
            case 'warning':

                break;

            case 'error':
                vscode.window.showErrorMessage(text);
                break;

            default:
                vscode.window.showInformationMessage(text, options);
                break;
        }
    }

    public static outputMessage(msgHeadline: string, MsgBody: string[], popUpToUI: boolean = false, addEndLine = true) {
        let date = new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(Date.now());

        if (msgHeadline) {
            helper.msgChannel.appendLine('-------------------- ' + date + ' - ' + msgHeadline + ' --------------------');
            helper.msgChannel.appendLine('');
        }

        if (MsgBody.length <= 0)
            MsgBody = helper.msgCache;
        helper.msgCache = [];

        if (MsgBody) {
            MsgBody.forEach(msg => {
                helper.msgChannel.appendLine(msg);
            });
        }

        if (popUpToUI) {
            helper.msgChannel.show(true);
        }

        if (addEndLine) {
            helper.msgChannel.appendLine('');
        }
    }

    public static cacheMessage(msg: string) {
        helper.msgCache.push(msg);
    }
}