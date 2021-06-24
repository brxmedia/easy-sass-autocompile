import * as vscode from 'vscode';
import * as fs from 'fs';
import { esac } from './helper';
import { ITargetPaths } from '../fileHelper';

export class compileHelper {
    private sassBin: string = "";
    private SassCompiler: any = null;

    public static get instance() {
        let config = vscode.workspace.getConfiguration('easySassAutocompile');
        let sassBinLocation = config.get('sassBinLocation') as string;

        let sassBin = '/usr/local/lib/node_modules/sass/sass.dart.js';
        // let sassBin = 'C:\\Users\\PBorn\\AppData\\Roaming\\npm\\node_modules\\sass\\sass.dart.js';

        if (sassBinLocation != undefined && sassBinLocation.length > 1) {
            sassBin = sassBinLocation;
        }

        if (esac.file.fileExists(sassBin)) {
            let instance = new compileHelper();
            instance.setSassBin(sassBin);
            instance.setSassCompiler(sassBin);

            return instance;
        }

        // helper.systemMessage('Path to Sass Binary does not exist. ' + sassBin + '', 'error');
        // helper.statusBarUi.error();
        return null;
    }

    get info() {
        return {
            sassBin: this.sassBin,
            sassInfo: this.SassCompiler.info
        }
    }

    setSassCompiler(sassBin: string) {
        this.SassCompiler = require(sassBin);
    }

    setSassBin(sassBin: string) {
        this.sassBin = sassBin;
    }

    async onSave(document: vscode.TextDocument) {
        if (esac.file.isSassOrScss(document)) {
            esac.file.inlineCommands(document).then((inlineCommands) => {

                // TODO: a function to check for @import sass functions,
                // find the files that will be imported and check if they dirty, 
                // if so pop up message to save them.

                // is there a mainfile set up in the inline commands
                if (typeof inlineCommands.main == 'string') {
                    let mainFileUri = vscode.Uri.file(inlineCommands.main);

                    esac.file.saveFile(mainFileUri, document);
                }
                else {
                    if (typeof inlineCommands.outputStyle == 'string') {

                    }

                    if (typeof inlineCommands.outputFile == 'string') {

                    }

                    let config = vscode.workspace.getConfiguration('easySassAutocompile');

                    let sourceMap = config.get('sourceMap') as boolean;
                    let minify = config.get('minify') as boolean;
                    let subFolder = config.get('subFolder') as string;

                    esac.file.targetPaths(document.fileName, subFolder, "").then((targetPaths) => {

                        console.log(targetPaths);

                        this.compile(targetPaths, sourceMap, minify);

                    });
                }
            });
        }
    }

    async compile(targetPaths: ITargetPaths, sourceMap: boolean, minify: boolean) {

        let targetPath = esac.file.join(targetPaths.targetPath, targetPaths.target);
        let outputPath = esac.file.join(targetPaths.path, targetPaths.css);

        this.compileCss(targetPath, sourceMap, outputPath);
        console.log('start compiling');
    }

    compileCss(_file: string, _sourceMap: boolean, _outFile: string, _outputStyle: string = "expanded") {
        return new Promise<string | boolean>((resolve) => {
            try {
                let result = this.SassCompiler.renderSync({
                    file: _file,
                    sourceMap: _sourceMap,
                    outFile: _outFile,
                    outputStyle: _outputStyle
                });

                console.log(result.css.toString());

                // let file = fileHelper.instance.writeFile(_outFile, result.css);

                // file.then(file => {
                //     if (file.err != null) {
                //         // helper.cacheMessage('Compiler Error: ' + file.FilePath.toString());
                //         // helper.cacheMessage(' - ' + file.err.toString());
                //         resolve({
                //             err: true,
                //             compileErr: false
                //         });
                //     }
                //     else {
                //         // helper.cacheMessage('Successfully compiled: ' + file.FilePath.toString());

                //         if (_sourceMap) {
                //             esac.file.writeFile(_outFile + ".map", result.map).then(result => {
                //                 if (fileMap.err != null) {
                //                     // helper.cacheMessage('Compiler Error: ' + fileMap.FilePath.toString());
                //                     // helper.cacheMessage(' - ' + fileMap.err.toString());
                //                     resolve({
                //                         err: true,
                //                         compileErr: false
                //                     });
                //                 }
                //                 else {
                //                     // helper.cacheMessage('Successfully compiled: ' + fileMap.FilePath.toString());
                //                     resolve({
                //                         err: false,
                //                         compileErr: false
                //                     });
                //                 }
                //             });
                //         }
                //         resolve({
                //             err: false,
                //             compileErr: false
                //         });
                //     }
                // });

            } catch (error) {
                // helper.systemMessage('Could not compile SASS. ' + _file + ' Check Outputs for more information.', 'error');
                // helper.statusBarUi.error();

                // helper.outputMessage('Sass Error', ['Sass syntax error at line ' + error.line + ', column ' + error.column, error.file], true);

                return {
                    err: true,
                    sassErr: true
                };
            }
        });
    }
}