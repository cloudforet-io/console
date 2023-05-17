#!/usr/bin/env node

/* eslint-disable */

/**
 * generate svg icons object
 * @since 2023-05-12
 */

const path = require('path');

const { Command } = require('commander');

const { build } = require('./build');

const program = new Command();
program
    .option('-s, --svgSourcePath <path>', 'Svg source path')
    .option('-t, --targetPath <path>', 'Generate icon path')
    .option('-e, --ext <ext>', "Generated file's extension", 'js')
    .option('--svgo <svgo>', 'Svgo config file', 'svgo')
    .parse(process.argv);

// svg file path
const sourcePath = path.isAbsolute(program.opts().svgSourcePath)
    ? program.opts().svgSourcePath
    : path.join(process.cwd(), program.opts().svgSourcePath);

// generated icon path
const targetPath = path.isAbsolute(program.opts().targetPath)
    ? program.opts().targetPath
    : path.join(process.cwd(), program.opts().targetPath);

// auto run
(async () => {
    try {
        await build({
            sourcePath,
            targetPath,
        });
    } catch (err) {
        console.log(err);
    }
})();
