import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { fileHelper } from './fileHelper';
import { SourceMap } from 'module';


export class compileHelper {
    private sassBin:string = "";
    private SassCompiler:any = null;

    public static get instance() {
        let config = vscode.workspace.getConfiguration('easySassAutocompile');
        let sassBinLocation = config.get('sassBinLocation') as string;

        let sassBin = '/usr/local/lib/node_modules/sass/sass.dart.js';
        // let sassBin = 'C:\\Users\\PBorn\\AppData\\Roaming\\npm\\node_modules\\sass\\sass.dart.js';

        if (sassBinLocation != undefined && sassBinLocation.length > 1) {
            sassBin = sassBinLocation;
        }
        console.log(sassBin);

        let instance = new compileHelper();
        instance.setSassBin(sassBin);
        instance.setSassCompiler(sassBin);

        return instance;
    }

    info() {
        console.log(this.sassBin);
        console.log(this.SassCompiler.info);
    }

    setSassCompiler(sassBin: string) {
        this.SassCompiler = require(sassBin);
    }

    setSassBin(sassBin: string){
        this.sassBin = sassBin;
    }

    async onSave(document: vscode.TextDocument) {
        let main = fileHelper.instance.mainFile(document);
        vscode.window.setStatusBarMessage('Sass Autocompile: Building...', 10000);

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

            let targetPath = path.join(paths.targetPath, paths.target);
            let outputPath = path.join(paths.path, paths.css);

            let compiled = this.compileCss(targetPath, sourceMap, outputPath);

            if (minify && compiled) {
                let outputMinPath = path.join(paths.path, paths.min);

                this.compileCss(targetPath, sourceMap, outputMinPath, "compressed");
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

            fs.writeFileSync(_outFile, result.css, 'utf-8');
            if (SourceMap) {
                fs.writeFileSync(_outFile + ".map", result.map, 'utf-8');
            }
            vscode.window.setStatusBarMessage('Sass Autocompile: Done', 10000);


        } catch (error) {
            vscode.window.showErrorMessage('Autocompile - Could not compile SASS. ' + _file + ' Check Outputs for more information.');
            vscode.window.setStatusBarMessage('Sass Autocompile: Error', 10000);
            console.log(error.formatted);

            return false;
        }

        return true;
    }
}