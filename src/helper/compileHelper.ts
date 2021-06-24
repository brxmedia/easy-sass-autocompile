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
                    let outputFile = "";

                    esac.file.targetPaths(document.fileName, subFolder, outputFile).then((targetPaths) => {

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

        this.compileCss(targetPath, sourceMap, outputPath).then((result) => {
            if(result){
                if(minify){
                    outputPath = esac.file.join(targetPaths.path, targetPaths.min);

                    this.compileCss(targetPath, sourceMap, outputPath, 'compressed').then((result) => {
                        if(result){
                            esac.message.outputMessage('Successfully compiled', []);
                            esac.satusBar.success();
                        }
                    });
                }
                else{
                    esac.message.outputMessage('Successfully compiled', []);
                    esac.satusBar.success();
                }
            }
        });
    }

    compileCss(_file: string, _sourceMap: boolean, _outFile: string, _outputStyle: string = "expanded") {
        return new Promise<boolean>((resolve) => {
            try {
                let sassResult = this.SassCompiler.renderSync({
                    file: _file,
                    sourceMap: _sourceMap,
                    outFile: _outFile,
                    outputStyle: _outputStyle
                });

                esac.file.writeFile(_outFile, sassResult.css).then((result) => {
                    let prompt = (result: NodeJS.ErrnoException) => {

                        esac.message.systemMessage('Could not save file. ' + _file + ' Check Outputs for more information.', 'error');
                        esac.satusBar.error();

                        esac.message.outputMessage('File writing error', [result.toString()], true);
                        resolve(false);
                    };

                    if (typeof result == 'string') {
                        esac.message.cacheMessage('Successfully compiled: ' + _outFile);
                        if (_sourceMap) {
                            esac.file.writeFile(_outFile + '.map', sassResult.map).then((result) => {
                                if (typeof result == 'string') {
                                    esac.message.cacheMessage('Successfully compiled: ' + _outFile + '.map');
                                    resolve(true);
                                }
                                else {
                                    prompt(result);
                                }
                            });
                        }
                    }
                    else {
                        prompt(result);
                    }
                });
            } catch (error) {
                esac.message.systemMessage('Could not compile SASS. ' + _file + ' Check Outputs for more information.', 'error');
                esac.satusBar.error();

                esac.message.outputMessage('Sass error', ['Sass syntax error at line ' + error.line + ', column ' + error.column, error.file], true);
                resolve(false);
            }
        });
    }
}