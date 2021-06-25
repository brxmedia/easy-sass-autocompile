import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Position, Range, TextEditor, TextEditorEdit } from 'vscode';

const lineReader = require('line-reader');

export interface IInlineCommands {
    main: string | boolean,
    outputStyle: string | boolean,
    outputFile: string | boolean
}
export interface ITargetPaths {
    targetPath: string,
    target: string,
    path: string,
    css: string,
    min: string
}

export class fileHelper {
    public static get instance() {
        return new fileHelper();
    }

    isSassOrScss(document: vscode.TextDocument) {
        if (document.fileName.toLowerCase().endsWith('.scss') || document.fileName.toLowerCase().endsWith('.sass')) {
            return true;
        }
        else {
            return false;
        }
    }

    inlineCommands(document: vscode.TextDocument) {
        return new Promise<IInlineCommands>((resolve) => {
            lineReader.eachLine(document.fileName, function (line: string) {

                let main: string | boolean = false;
                let outputStyle: string | boolean = false;
                let outputFile: string | boolean = false;

                // if no comment in first line!
                if (line.indexOf('//') != 0) {
                    resolve({
                        main: false,
                        outputStyle: false,
                        outputFile: false
                    });
                }

                // checking for "main" is found
                if (line.indexOf('main') > -1) {
                    let data = (/\/\/\s*main\:\s*([\.\/\w]+)/g).exec(line);
                    if (data != null && data.length > 1) {
                        let seperator = '/';
                        if (document.fileName.includes('\\')) {
                            seperator = '\\';
                        }
                        let filePath = path.join(document.fileName.substring(0, document.fileName.lastIndexOf(seperator)), data[1]);
                        if (fs.existsSync(filePath)) {
                            main = filePath;
                        }
                    }
                }

                // console.log(line.indexOf('outputStyle'));
                // // checking for "main" is found
                // if (line.indexOf('outputStyle') > -1) {
                //     let data = (/\/\/\s*outputStyle\:\s*([\.\/\w]+)/g).exec(line);
                //     if (data != null && data.length > 1) {
                //     }
                // }

                resolve({
                    main: main,
                    outputStyle: outputStyle,
                    outputFile: outputFile
                });
            });
        });
    }

    saveFile(fileUri: vscode.Uri, oriDoc: vscode.TextDocument) {
        vscode.workspace.openTextDocument(fileUri).then((doc) => {
            let save = () => {
                doc.save();
            }

            if (!doc.isDirty) {
                // make it dirty.
                vscode.window.showTextDocument(doc, { preview: false }).then((editor) => {
                    editor.edit((editorEdit) => {
                        this.setDirty(editor, editorEdit);
                    }).then(() => {
                        vscode.window.showTextDocument(oriDoc, { preview: false }).then((oriEditor) => {
                            oriEditor.edit(() => {
                                save();
                            });
                        });
                    })
                });
            }
            else {
                save();
            }
        });
    }

    targetPaths(main: string, subFolder: string, outputFile: string) {
        return new Promise<ITargetPaths>((resolve) => {
            let tPath = path.dirname(main);
            let tTarget = path.basename(main);
            let oPath = tPath;
            let oTarget = tTarget.substr(0, tTarget.length - 4) + 'css';
            let oMinTarget = tTarget.substr(0, tTarget.length - 4) + 'min.css';

            if (outputFile.length >= 0 && outputFile.includes('.css')) {
                let tOutputFile = outputFile.substr(0, outputFile.length - 3) + 'css';
                let tMinOutputFile = outputFile.substr(0, outputFile.length - 3) + 'min.css';

                oTarget = tOutputFile;
                oMinTarget = tMinOutputFile;
            }

            if (subFolder != undefined && subFolder.length > 0) {
                oPath = path.join(tPath, subFolder);
            }
            resolve({
                targetPath: tPath,
                target: tTarget,
                path: oPath,
                css: oTarget,
                min: oMinTarget
            });
        });
    }

    // Set the dirty bit on 'textEditor'.  This is meant to be called as a
    // text editor command.
    async setDirty(textEditor: TextEditor, editBuilder: TextEditorEdit): Promise<void> {
        // The strategy here is to make a change that has no effect.  If the
        // document has text in it, we can replace some text with itself
        // (simply inserting an empty string does not work).  We prefer to
        // edit text at the end of the file in order to minimize spurious
        // recomputation by analyzers.

        // Try to replace the last line.
        if (textEditor.document.lineCount >= 2) {
            const lineNumber = textEditor.document.lineCount - 2;
            const lastLineRange = new Range(
                new Position(lineNumber, 0),
                new Position(lineNumber + 1, 0));
            const lastLineText = textEditor.document.getText(lastLineRange);
            editBuilder.replace(lastLineRange, lastLineText);
            return;
        }

        // Try to replace the first character.
        const range = new Range(new Position(0, 0), new Position(0, 1));
        const text = textEditor.document.getText(range);
        if (text.length > 0) {
            editBuilder.replace(range, text);
            return;
        }

        // With an empty file, we first add a character and then remove it.
        // This has to be done as two edits, which can cause the cursor to
        // visibly move and then return, but we can at least combine them
        // into a single undo step.
        await textEditor.edit(
            (innerEditBuilder: TextEditorEdit) => {
                innerEditBuilder.replace(range, " ");
            },
            { undoStopBefore: true, undoStopAfter: false });

        await textEditor.edit(
            (innerEditBuilder: TextEditorEdit) => {
                innerEditBuilder.replace(range, "");
            },
            { undoStopBefore: false, undoStopAfter: true });
    }

    fileExists(FilePath: string) {
        return fs.existsSync(FilePath);
    }

    writeFile(FilePath: string, Data: string) {
        return new Promise<string | NodeJS.ErrnoException>((resolve) => {
            fs.writeFile(FilePath, Data, 'utf-8', (err) => {
                if (err)
                    resolve(err);
                resolve(FilePath);
            });
        });
    }

    join(path1: string, path2: string) {
        return path.join(path1, path2);
    }
}