import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { fileHelper } from './fileHelper';
import { SourceMap } from 'module';


export class compileHelper {
    // private SassCompiler = require('/usr/local/lib/node_modules/sass/sass.dart.js');
    private SassCompiler = require('C:\\Users\\PBorn\\AppData\\Roaming\\npm\\node_modules\\sass\\sass.dart.js');

    public static get instance() {
        let config = vscode.workspace.getConfiguration('easySassAutocompile');
        let sassPath = config.get('sassPath') as string;
        let instance = new compileHelper();

        if (sassPath != undefined && sassPath.length > 1) {
            instance.setSassCompiler(sassPath);
        }

        return instance;
    }

    info() {
        console.log(this.SassCompiler.info);
    }

    setSassCompiler(sassPath: string) {
        this.SassCompiler = require(sassPath);
    }

    async onSave(document: vscode.TextDocument) {
        let main = fileHelper.instance.mainFile(document);

        main.then(main => {
            this.compile(main);
        });

        // let tempfilePath = '/Volumes/Development/liquify.foundation/css/liquify.scss';
        // let tempOutputPath = '/Volumes/Development/liquify.foundation/css/liquify.css'
        // let tempOutputPathMap = '/Volumes/Development/liquify.foundation/css/liquify.css.map'

        // console.log(SassCompiler.info);
        // var result = SassCompiler.renderSync({
        // 	file: tempfilePath,
        // 	sourceMap: true,
        // 	outFile: tempOutputPath
        // });

        // fs.writeFileSync(tempOutputPath, result.css, 'utf-8');
        // fs.writeFileSync(tempOutputPathMap, result.map, 'utf-8');
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

            // console.log(sourceMap);
            // console.log(minify);
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


        } catch (error) {
            vscode.window.showErrorMessage('Autocompile - Could not compile SASS. ' + _file + ' Check Outputs for more information.');
            vscode.window.setStatusBarMessage('Autocompile: Error', 10000);
            console.log(error.formatted);

            return false;
        }

        return true;
    }
}