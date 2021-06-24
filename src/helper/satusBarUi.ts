import * as vscode from 'vscode';

export class statusBarUi {

    private static _statusBarItem: vscode.StatusBarItem;

    private static get statusBarItem() {
        if (!statusBarUi._statusBarItem) {
            statusBarUi._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
            this.statusBarItem.show();
        }

        return statusBarUi._statusBarItem;
    }

    static init() {
        statusBarUi.building("Initialization...");
        setTimeout(function () {
            statusBarUi.info();
        }, 1000);
    }

    static info() {
        statusBarUi.statusBarItem.text = `$(telescope) Sass Autocompile`;
        statusBarUi.statusBarItem.color = 'inherit';
        statusBarUi.statusBarItem.command = 'easy-sass-autocompile.info';
        statusBarUi.statusBarItem.tooltip = "Click for more information.";
    }

    static building(workingMsg: string = "Building...") {
        statusBarUi.statusBarItem.text = `$(pulse) ${workingMsg}`;
        statusBarUi.statusBarItem.tooltip = 'In case if it takes long time, Show output window and report.';
        statusBarUi.statusBarItem.color = '#a78800';
        statusBarUi.statusBarItem.command = undefined;
    }

    // Quick status bar messages after compile success or error
    static success() {
        statusBarUi.statusBarItem.text = `$(check) Sass Autocompile: Success`;
        statusBarUi.statusBarItem.color = '#57c200';
        statusBarUi.statusBarItem.command = undefined;

        setTimeout(function () {
            statusBarUi.statusBarItem.color = 'inherit';
            statusBarUi.info();
        }, 6500);
    }
    static error() {
        statusBarUi.statusBarItem.text = `$(x) Sass Autocompile: Error`;
        statusBarUi.statusBarItem.color = '#c22700';
        statusBarUi.statusBarItem.command = undefined;

        setTimeout(function () {
            statusBarUi.statusBarItem.color = 'inherit';
            statusBarUi.info();
        }, 6500);
    }

    static dispose() {
        statusBarUi.statusBarItem.dispose();
    }
}