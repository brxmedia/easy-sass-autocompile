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

```scss
//main: location/to/your/main/file.scss
```
The `main:` inline option will prevent your current file from be compiled and compile the main file instead.

> Other inline option will follow in the future, as i know some I want to implement just jet. If you have some wishes feal free to contact me.

## Sass Installation

Now to the most important part of the installation. Make sure you install the right version and know the location of your intallation. Here I will cover the most cases I am aware of.

> Please read all the Sass installation instruction to get the best installation for your case. This information came from [https://sass-lang.com/install](https://sass-lang.com/install)

### Install Anywhere (Standalone)

You can install Sass on Windows, Mac, or Linux by downloading the package for your operating system from [GitHub](https://github.com/sass/dart-sass/releases/tag/1.35.1) and adding it to your [PATH](https://katiek2.github.io/path-doc/). That’s all—there are no external dependencies and nothing else you need to install.

### Install Anywhere (npm)

If you use Node.js, you can also install Sass using npm by running

```
npm install -g sass
```

**However, please note** that this will install the pure JavaScript implementation of Sass, which runs somewhat slower than the other options listed here. But it has the same interface, so it’ll be easy to swap in another implementation later if you need a bit more speed!

### Install on Windows (Chocolatey)
If you use the Chocolatey package manager for Windows, you can install Dart Sass by running

```
choco install sass
```

### Install on Mac OS X or Linux (Homebrew)
If you use the Homebrew package manager for Mac OS X or Linux, you can install Dart Sass by running

```
brew install sass/sass/sass
```

