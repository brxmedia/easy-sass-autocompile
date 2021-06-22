import * as vscode from 'vscode';
import * as path from 'path';
import { fileHelper } from './fileHelper';
import { helper } from './helper';


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
            if (compiled) {
                if (minify) {
                    let outputMinPath = path.join(tTargetPath, paths.min);

                    this.compileCss(targetPath, sourceMap, outputMinPath, "compressed");
                }

                helper.outputMessage('Successfully compiled', []);
                helper.statusBarUi.success();
            }
            else{
                helper.outputMessage('Error compiling', [], true, true);
                helper.statusBarUi.error();
            }
        });
    }

    compileCss(_file: string, _sourceMap: boolean, _outFile: string, _outputStyle: string = "expanded") {
        try {
            let result = this.SassCompiler.renderSync({
                file: _file,
                sourceMap: _sourceMap,
                outFile: _outFile,
                outputStyle: _outputStyle
            });


            let generated = fileHelper.instance.writeFile(_outFile, result.css);
            if (generated) {
                if (_sourceMap) {
                    fileHelper.instance.writeFile(_outFile + ".map", result.map);
                }
                return true;
            }
            return false;

        } catch (error) {
            helper.systemMessage('Could not compile SASS. ' + _file + ' Check Outputs for more information.', 'error');
            helper.statusBarUi.error();

            helper.outputMessage('Sass Error', ['Sass syntax error at line ' + error.line + ', column ' + error.column, error.file], true);

            return false;
        }
    }
}