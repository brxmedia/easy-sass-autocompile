import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { helper } from './helper';

var lineReader = require('line-reader');

export interface ITargetPaths {
    targetPath: string,
    target: string,
    path: string,
    css: string,
    min: string
}
export interface IWriteFile {
    FilePath: string,
    err: NodeJS.ErrnoException | null
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

    mainFile(document: vscode.TextDocument) {
        return new Promise<string>((resolve) => {
            let mainFile = document.fileName;

            let res = () => {
                resolve(mainFile);
            };

            lineReader.eachLine(document.fileName, function (line: string) {
                if (line.indexOf('//') != 0) {
                    res();
                    return false;
                }

                if (line.indexOf('main') > -1) {
                    let data = (/\/\/\s*main\:\s*([\.\/\w]+)/g).exec(line);
                    if (data != null && data.length > 1) {
                        let seperator = '/';
                        if (document.fileName.includes('\\')) {
                            seperator = '\\';
                        }
                        let filePath = path.join(document.fileName.substring(0, document.fileName.lastIndexOf(seperator)), data[1]);
                        if (fs.existsSync(filePath)) {
                            mainFile = filePath;
                        }
                    }
                }
            });
        });

    }

    targetPaths(main: string) {
        return new Promise<ITargetPaths>((resolve) => {
            let config = vscode.workspace.getConfiguration('easy-sass-autocompile');

            let tPath = path.dirname(main);
            let tTarget = path.basename(main);
            let oPath = tPath;
            let oTarget = tTarget.substr(0, tTarget.length - 4) + 'css';
            let oMinTarget = tTarget.substr(0, tTarget.length - 4) + 'min.css';

            if (config.subFolder != undefined && config.subFolder.length > 0) {
                oPath = path.join(tPath, config.subFolder);
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

    writeFile(FilePath: string, Data: string) {
        return new Promise<IWriteFile>((resolve) => {
            fs.writeFile(FilePath, Data, 'utf-8', (err) => {
                resolve({
                    FilePath: FilePath, 
                    err: err
                });
            });
        });
    }

    fileExists(FilePath: string) {
        return fs.existsSync(FilePath);
    }
}