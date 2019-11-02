const webfontsGenerator = require('webfonts-generator');
const fs = require('fs');
const path = require('path');

const customOptions = {
    iconPath: 'src/assets/icons/',
    dest: 'src/styles/icon-fonts/',
    excepts: ['ic_alert.svg'],
    cssFontsUrl: '~@/styles/icon-fonts',
    templateOptions: {
        classPrefix: 'p-i-',
        baseSelector: '.p-icon',
        fontName: 'p-icon-font',
    },
    fontName: 'p-icon-font',
    cssDest: 'src/styles/icon-fonts.scss',
    cssTemplate: path.join(__dirname, './webfont-css-template.hbs'),
    // fileStart: 0,
    // fileEnd: 0
};

const cropFileNames = function (files, start, end) {
    const from = start || 0;
    const to = end === undefined ? files.length : end;
    return files.slice(from, to);
};

const removeExceptionFromFileNames = function (files, excepts) {
    excepts.map((except) => {
        let idx;
        if (files.some((icon, i) => {
            if (icon === except) {
                idx = i;
            }
            return icon === except;
        })) {
            files.splice(idx, 1);
        }
        return undefined;
    });
    return files;
};

const setPathToFileNames = function (files, iconPath) {
    return files.map(file => `${iconPath}${file}`);
};

const readFileNames = function (path) {
    return fs.readdirSync(path);
};

const getIconFileList = function () {
    let files = readFileNames(customOptions.iconPath);
    files = cropFileNames(files, customOptions.fileStart, customOptions.fileEnd);
    files = removeExceptionFromFileNames(files, customOptions.excepts);
    files = setPathToFileNames(files, customOptions.iconPath);

    console.log('###################### ICONS ###################### \n');
    console.log(files);
    console.log('\n ###################################################');
    return files;
};

const generatorOptions = {
    files: getIconFileList(),
    dest: customOptions.dest,
    fontName: customOptions.fontName,
    cssFontsUrl: customOptions.cssFontsUrl,
    templateOptions: customOptions.templateOptions,
    cssDest: customOptions.cssDest,
    cssTemplate: customOptions.cssTemplate,
};

const handler = (error) => {
    if (error) {
        console.error('Fail!', error);
    } else {
        console.log('Done!');
    }
};

const runGenerator = function () {
    if (generatorOptions.files.length === 0) {
        console.log('NO FILES TO RUN. END.');
    } else {
        webfontsGenerator(generatorOptions, handler);
    }
};

runGenerator();
