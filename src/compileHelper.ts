import * as vscode from 'vscode';
import * as path from 'path';
import { fileHelper } from './fileHelper';
import { helper } from './helper';

export interface ICompile {
    err: boolean,
    compileErr: boolean
}
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

        if (fileHelper.instance.fileExists(sassBin)) {
            let instance = new compileHelper();
            instance.setSassBin(sassBin);
            instance.setSassCompiler(sassBin);
            helper.statusBarUi.init();

            return instance;
        }

        helper.systemMessage('Path to Sass Binary does not exist. ' + sassBin + '', 'error');
        helper.statusBarUi.error();
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
        let main = fileHelper.instance.mainFile(document);
        helper.statusBarUi.building();

        main.then(main => {
            this.compile(main);
        });
    }

    compile(main: string) {
        let targetPaths = fileHelper.instance.targetPaths(main);

        targetPaths.then(paths => {
            let config = vscode.workspace.getConfiguration('easySassAutocompile');

            let sourceMap = config.get('sourceMap') as boolean;
            let minify = config.get('minify') as boolean;
            let subFolder = config.get('subFolder') as string;

            let tTargetPath = paths.targetPath;
            if (subFolder.length > 0) {
                tTargetPath = path.join(paths.targetPath, subFolder);
            }

            let targetPath = path.join(paths.path, paths.target);
            let outputPath = path.join(tTargetPath, paths.css);

            let compiled = this.compileCss(targetPath, sourceMap, outputPath);

            compiled.then(compiled => {
                if (!compiled.compileErr) {
                    if (!compiled.err) {
                        if (minify) {
                            let outputMinPath = path.join(tTargetPath, paths.min);

                            let compiledMap = this.compileCss(targetPath, sourceMap, outputMinPath, "compressed");
                            compiledMap.then(compiledMap => {
                                if (!compiledMap.err) {
                                    helper.outputMessage('Successfully compiled', []);
                                    helper.statusBarUi.success();
                                }
                                else {
                                    helper.outputMessage('Error compiling', [], true, true);
                                    helper.statusBarUi.error();
                                }
                            });
                        }
                        else {
                            helper.outputMessage('Successfully compiled', []);
                            helper.statusBarUi.success();
                        }
                    }
                    else {
                        helper.outputMessage('Error compiling', [], true, true);
                        helper.statusBarUi.error();
                    }
                }
            });
        });
    }

    compileCss(_file: string, _sourceMap: boolean, _outFile: string, _outputStyle: string = "expanded") {
        return new Promise<ICompile>((resolve) => {
            try {
                let result = this.SassCompiler.renderSync({
                    file: _file,
                    sourceMap: _sourceMap,
                    outFile: _outFile,
                    outputStyle: _outputStyle
                });


                let file = fileHelper.instance.writeFile(_outFile, result.css);

                file.then(file => {
                    if (file.err != null) {
                        helper.cacheMessage('Compiler Error: ' + file.FilePath.toString());
                        helper.cacheMessage(' - ' + file.err.toString());
                        resolve({
                            err: true,
                            compileErr: false
                        });
                    }
                    else {
                        helper.cacheMessage('Successfully compiled: ' + file.FilePath.toString());
                        
                        if (_sourceMap) {
                            let fileMap = fileHelper.instance.writeFile(_outFile + ".map", result.map);
                            fileMap.then(fileMap => {
                                if (fileMap.err != null) {
                                    helper.cacheMessage('Compiler Error: ' + fileMap.FilePath.toString());
                                    helper.cacheMessage(' - ' + fileMap.err.toString());
                                    resolve({
                                        err: true,
                                        compileErr: false
                                    });
                                }
                                else {
                                    helper.cacheMessage('Successfully compiled: ' + fileMap.FilePath.toString());
                                    resolve({
                                        err: false,
                                        compileErr: false
                                    });
                                }
                            });
                        }
                        resolve({
                            err: false,
                            compileErr: false
                        });
                    }
                });

            } catch (error) {
                helper.systemMessage('Could not compile SASS. ' + _file + ' Check Outputs for more information.', 'error');
                helper.statusBarUi.error();

                helper.outputMessage('Sass Error', ['Sass syntax error at line ' + error.line + ', column ' + error.column, error.file], true);

                return {
                    err: true,
                    sassErr: true
                };
            }
        });
    }
}