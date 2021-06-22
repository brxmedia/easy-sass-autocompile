import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { fileHelper } from './fileHelper';
import {helper} from './helper';


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

        if(fileHelper.instance.fileExists(sassBin)){
            let instance = new compileHelper();
            instance.setSassBin(sassBin);
            instance.setSassCompiler(sassBin);

            return instance;
        }

        helper.systemMessage('Path to Sass Binary does not exist. ' + sassBin + '', 'error');
        return null;
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
        helper.systemMessage("Building...", 'status');

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
            if (_sourceMap) {
                fs.writeFileSync(_outFile + ".map", result.map, 'utf-8');
            }
            helper.systemMessage('Done', 'status');


        } catch (error) {
            helper.systemMessage('Autocompile - Could not compile SASS. ' + _file + ' Check Outputs for more information.', 'error');
            console.log(error.formatted);

            return false;
        }

        return true;
    }
}