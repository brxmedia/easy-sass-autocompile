import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

var lineReader = require('line-reader');

export interface ITargetPaths {
    targetPath: string,
    target: string,
    path: string,
    css: string,
    min: string
}

export class fileHelper{
    public static get instance() {
        return new fileHelper();
    }

    isSassOrScss(document: vscode.TextDocument){
        if(document.fileName.toLowerCase().endsWith('.scss') || document.fileName.toLowerCase().endsWith('.sass')){
            return true;
        }
        else{
            return false;
        }
    }

    mainFile(document: vscode.TextDocument){
        return new Promise<string>((resolve) => {
            let mainFile = document.fileName;

            let res = () => {
                resolve(mainFile);
            };

            lineReader.eachLine(document.fileName, function(line: string) {  
                if(line.indexOf('//') != 0) {
                    res();
                    return false;
                }

                if(line.indexOf('main') > -1) {
                    let data = (/\/\/\s*main\:\s*([\.\/\w]+)/g).exec(line);
                    if(data != null && data.length > 1) {
                        let filePath = path.join(document.fileName.substring(0, document.fileName.lastIndexOf('\\')), data[1]);
                        // console.log(filePath);
                        if(fs.existsSync(filePath)) {
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

            if (config.subFolder != undefined && config.subFolder.length > 0) {
                oPath = path.join(tPath, config.subFolder);
            }
            resolve({
                targetPath: tPath,
                target: tTarget,
                path: oPath,
                css: "test.css",
                min: "test.min.css"
            });
        });
    }

    writeFile(FilePath:string, Data:string){
        fs.writeFileSync(FilePath, Data, 'utf-8');
    }
}