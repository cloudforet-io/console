/* eslint-disable */

const path = require('path');

const colors = require('colors');
const fs = require('fs-plus');
const glob = require('glob');
const Svgo = require('svgo');

const defaultSvgoConfig = require('./svgo');

/**
 * build svg icon
 */
async function build(options) {
    const { sourcePath, targetPath } = options;


    return new Promise((resolve, reject) => {
        // delete previous icons
        fs.removeSync(targetPath);

        // the template file which to generate icon files
        const tplPath = path.join(
            __dirname,
            './icon.tpl.txt',
        );
        const tpl = fs.readFileSync(tplPath, 'utf8');
        const svgo = new Svgo(defaultSvgoConfig);

        glob(path.join(sourcePath, '**/*.svg'), (
            err,
            files,
        ) => {
            if (err) {
                reject(err);
                return;
            }

            const normalizedFilePaths = files.map((f) => path.normalize(f));

            normalizedFilePaths.forEach(async (filename, ix) => {
                const name = path.basename(filename).split('.')[0];
                const svgContent = fs.readFileSync(filename, 'utf-8');
                const result = (await svgo.optimize(
                    svgContent,
                ));
                let data = result.data
                    .replace(/<svg[^>]+>/gi, '')
                    .replace(/<\/svg>/gi, '');

                // get view box
                const viewBox = getViewBox(result);

                // add pid attr, for css
                data = addPid(data);

                // rename fill and stroke. (It can restroe in vue-svgicon)
                data = renameStyle(data);

                // escape single quotes
                data = data.replace(/'/g, "\\'");

                const content = compile(tpl, {
                    name,
                    width: parseFloat(result.info.width) || 16,
                    height: parseFloat(result.info.height) || 16,
                    viewBox: `'${viewBox}'`,
                    data,
                });

                try {
                    fs.writeFileSync(
                        path.join(
                            targetPath,
                            `${name}.js`,
                        ),
                        content,
                        'utf-8',
                    );
                    console.log(colors.yellow(`Generated icon: ${name}`));

                    if (ix === normalizedFilePaths.length - 1) {
                        generateIndex(options, normalizedFilePaths);
                        resolve();
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
    });
}

// simple template compile
function compile(content, data) {
    return content.replace(/\${(\w+)}/gi, (match, name) => (data[name] ? data[name] : ''));
}

// generate index.js, which import all icons
function generateIndex(opts, files) {
    let content = '';
    content += '/* eslint-disable */\n';

    files.forEach((file) => {
        const name = path.basename(file).split('.')[0];
        content += `import './${name}'\n`;
    });

    fs.writeFileSync(
        path.join(opts.targetPath, 'index.js'),
        content,
        'utf-8',
    );
    console.log(colors.green('Generated index.js'));
}

// get svg viewbox
function getViewBox(svgoResult) {
    const viewBoxMatch = svgoResult.data.match(
        /viewBox="([-\d.]+\s[-\d.]+\s[-\d.]+\s[-\d.]+)"/,
    );
    let viewBox = '0 0 200 200';

    if (viewBoxMatch && viewBoxMatch.length > 1) {
        viewBox = viewBoxMatch[1];
    } else if (svgoResult.info.height && svgoResult.info.width) {
        viewBox = `0 0 ${svgoResult.info.width} ${svgoResult.info.height}`;
    }

    return viewBox;
}

// add pid attr, for css
function addPid(content) {
    const shapeReg = /<(path|rect|circle|polygon|line|polyline|ellipse)\s/gi;
    let id = 0;
    return content.replace(shapeReg, (match) => `${match}pid="${id++}" `);
}

// rename fill and stroke. (It can restroe in vue-svgicon)
function renameStyle(content) {
    const styleShaeReg = /<(path|rect|circle|polygon|line|polyline|g|ellipse).+>/gi;
    const styleReg = /fill="|stroke="/gi;
    return content.replace(styleShaeReg, (shape) => shape.replace(styleReg, (styleName) => `_${styleName}`));
}

module.exports = {
    build,
};
