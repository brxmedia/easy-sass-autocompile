import * as vscode from 'vscode';
import * as fs from 'fs';
import { esac } from './helper';
import { ITargetPaths } from './fileHelper';

const autoprefixer = require('autoprefixer');
const postcss = require('postcss');

export class compileHelper {
    private sassBin: string = "";
    private SassCompiler: any = null;

    public static get instance() {
        let config = vscode.workspace.getConfiguration('easySassAutocompile');
        let sassBinLocation = config.get('sassBinLocation') as string;

        let sassBin = '/usr/local/lib/node_modules/dart-sass/sass.dart.js';

        if (sassBinLocation != undefined && sassBinLocation.length > 1) {
            sassBin = sassBinLocation;
        }

        if (esac.file.fileExists(sassBin)) {
            let instance = new compileHelper();
            instance.setSassBin(sassBin);
            instance.setSassCompiler(sassBin);

            return instance;
        }

        esac.message.systemMessage('Path to Sass Binary does not exist. ' + sassBin + '', 'error');
        esac.satusBar.error();
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
            esac.satusBar.building();
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
                    let config = vscode.workspace.getConfiguration('easySassAutocompile');

                    let sourceMap = config.get('sourceMap') as boolean;
                    let minify = config.get('minify') as boolean;
                    let autoprefix = config.get('autoprefixer') as boolean;

                    let outputStyle = config.get('outputStyle') as string;
                    if (typeof inlineCommands.outputStyle == 'string') {
                        outputStyle = inlineCommands.outputStyle;
                    }

                    let outputFile = "";
                    if (typeof inlineCommands.outputFile == 'string') {
                        outputFile = inlineCommands.outputFile;
                    }

                    let subFolder = config.get('subFolder') as string;
                    if (typeof inlineCommands.subFolder == 'string') {
                        subFolder = inlineCommands.subFolder;
                    }
                    if (subFolder != "") {
                        let seperator = esac.file.getSeperator(document.fileName);
                        let filePath = esac.file.join(document.fileName.substring(0, document.fileName.lastIndexOf(seperator)), subFolder);

                        let test = esac.file.makeDirIfNotAvailable(filePath);
                        if (!fs.existsSync(filePath)) {
                            esac.message.systemMessage('Could not create Folder. ' + filePath + '', 'error');
                            subFolder = "";
                        }
                    }

                    esac.file.targetPaths(document.fileName, subFolder, outputFile).then((targetPaths) => {

                        this.compile(targetPaths, sourceMap, minify, autoprefix, outputStyle);

                    });
                }
            });
        }
    }

    async compile(targetPaths: ITargetPaths, sourceMap: boolean, minify: boolean, autoprefix: boolean, outputStyle: string = 'expanded') {

        this.compileCss(targetPaths.path, targetPaths.target, sourceMap, targetPaths.css, autoprefix, outputStyle).then((result) => {
            if (result) {
                if (minify) {

                    this.compileCss(targetPaths.path, targetPaths.target, sourceMap, targetPaths.min, autoprefix, 'compressed').then((result) => {
                        if (result) {
                            esac.message.outputMessage('Successfully compiled', []);
                            esac.satusBar.success();
                        }
                    });
                }
                else {
                    esac.message.outputMessage('Successfully compiled', []);
                    esac.satusBar.success();
                }
            }
        });
    }

    compileCss(_filePath: string, _file: string, _sourceMap: boolean, _outFile: string, autoprefix: boolean, _outputStyle: string = "expanded") {
        return new Promise<boolean>((resolve) => {
            let targetPath = esac.file.join(_filePath, _file);
            let outputPath = esac.file.join(_filePath, _outFile);

            try {

                let sassResult = this.SassCompiler.renderSync({
                    file: targetPath,
                    sourceMap: _sourceMap,
                    outFile: _outFile,
                    outputStyle: _outputStyle
                });

                if (autoprefix) {
                    let sourceMap;

                    if(_sourceMap){
                        sourceMap = {
                            absolute: true,
                            annotation: _outFile + '.map',
                            inline: false
                        }
                    }

                    postcss([autoprefixer]).process(sassResult.css, {map: sourceMap}).then((result: any) => {
                        result.warnings().forEach((warn: any) => {
                            console.warn(warn.toString())
                        })
                        this.prepareCSS(targetPath, _sourceMap, outputPath, result.css, sassResult.map).then((result) => { resolve(result); });
                        console.log(result.css);
                    });
                }
                else {
                    this.prepareCSS(targetPath, _sourceMap, outputPath, sassResult.css, sassResult.map).then((result) => { resolve(result); });
                }
                // this.prepairCSS(targetPath, _sourceMap, outputPath, sassResult.css, sassResult.map).then((result) => { resolve(result); });
            } catch (error) {
                esac.message.systemMessage('Could not compile SASS. ' + targetPath + ' Check Outputs for more information.', 'error');
                esac.satusBar.error();

                console.log(error);

                //esac.message.outputMessage('Sass error', ['Sass syntax error at line ' + error.line + ', column ' + error.column, error.file], true);
                resolve(false);
            }
        });
    }

    prepareCSS(_file: string, _sourceMap: boolean, _outFile: string, _css: any, _map: any) {
        return new Promise<boolean>((resolve) => {
            esac.file.writeFile(_outFile, _css).then((result) => {
                let prompt = (result: NodeJS.ErrnoException) => {

                    esac.message.systemMessage('Could not save file. ' + _file + ' Check Outputs for more information.', 'error');
                    esac.satusBar.error();

                    esac.message.outputMessage('File writing error', [result.toString()], true);
                    resolve(false);
                };

                if (typeof result == 'string') {
                    esac.message.cacheMessage('Successfully compiled: ' + _outFile);
                    if (_sourceMap) {
                        esac.file.writeFile(_outFile + '.map', _map).then((result) => {
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
        });
    }
}