import * as vscode from 'vscode';

export class messageHelper {
    private static _msgChannel: vscode.OutputChannel;
    private static _prefix: string = "Sass Autocompile - ";
    private static _msgCache: string[] = [];

    private static get prefix() {
        return messageHelper._prefix;
    }

    private static get msgChannel() {
        if (!messageHelper._msgChannel) {
            messageHelper._msgChannel = vscode.window.createOutputChannel('Easy Sass Autocompiler');
        }
        return messageHelper._msgChannel;
    }

    private static get msgCache() {
        return messageHelper._msgCache;
    }
    private static set msgCache(value) {
        messageHelper._msgCache = value;
    }

    public static systemMessage(text: string = '', type: string = 'success', options: vscode.MessageOptions = {}) {
        text = messageHelper.prefix + text;

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
            messageHelper.msgChannel.appendLine('-------------------- ' + date + ' - ' + msgHeadline + ' --------------------');
            messageHelper.msgChannel.appendLine('');
        }

        if (MsgBody.length <= 0)
            MsgBody = messageHelper.msgCache;
        messageHelper.msgCache = [];

        if (MsgBody) {
            MsgBody.forEach(msg => {
                messageHelper.msgChannel.appendLine(msg);
            });
        }

        if (popUpToUI) {
            messageHelper.msgChannel.show(true);
        }

        if (addEndLine) {
            messageHelper.msgChannel.appendLine('');
        }
    }

    public static cacheMessage(msg: string) {
        messageHelper.msgCache.push(msg);
    }
}