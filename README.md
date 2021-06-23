# Easy Sass Autocompile

Automatically compile your .sass and .scss fles on save. This extension supports sass and dart-sass and shipped with some inline features.

## Features

The Basic feature is obviously to compile Sass to css. Easy Sass Autocompile does exactly this. But the reason to do this extension was to get some well functioning inline commands.

![example.gif](https://raw.githubusercontent.com/brxmedia/easy-sass-autocompile/master/example.gif)

## Requirements

For this extension to work you need the latest version of [Visual Studio Code](https://code.visualstudio.com) and you have to intall the latest version of [Sass](https://sass-lang.com/).

The following verions off Sass are supported:
 - Dart Sass
 - Note Sass <sub><sup>*(Version 3.0.0 or higher)*</sup></sub>

 For more information about Sass installation, check out the [Sass Installation](#sass-installation) section


## Installation

Install through Visual Studio Code Extensions by searching for `brxmedia easy-sass-autocompile`. You can also download and install it via the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=brxmedia.easy-sass-autocompile).

You can also install the extension by passing the following command to the VSC Quick Navigation. Press `CTRL+P` and enter 

```
ext install brxmedia.easy-sass-autocompile
```

## Usage
The use of this extension is as simple as it seams. Just save your `.sass` or `.scss` files.

## Settings
The following settings are available in the extension settings.
 - `easySassAutoCompiler.sassBinLocation : string`

    Insert the location of your Sass binary. The default location the extension will check  `/usr/local/lib/node_modules/sass/sass.dart.js`. This is the default path of dart sass mac installation.
 - `easySassAutoCompiler.soureMap : boolean`

    Automatically generate CSS source map link in `.css` and `.css.map` file.
 - `easySassAutoCompiler.soureMap : boolean`
 
    Automatically minifies the generated CSS in an additional `.min.css` file. Also compatible with source maps. All files will be generated in addition to the `.css` files.
 - `easySassAutoCompiler.subFolder : string`
 
    If you want to store your generated css files in a subfolder like `/dist`, it is also possible to use a relative filepath to maybe go to a higher folder level such as `../dist` or just go to the parent folder `../`.

## Inline Options

Currently the is only one inline option and that was the most important for me. Inline commands has to be in Line 1 of your file to be parsed correctly.

```css
//main: location/to/your/main/file.scss
```
The `main:` inline option will prevent your current file from be compiled and compile the main file instead.

> Other inline option will follow in the future, as i know some I want to implement just jet. If you have some wishes feal free to contact me.

## Sass Installation

