import { forEach, map } from 'lodash';

import { tailwindColors } from '@/styles/colors.cjs';


const styleVariables = map(tailwindColors, (c, n) => {
    if (typeof c !== 'object') return `--${n}: ${c};`;
    let res = '';
    forEach(c, (d, k) => {
        res = `${res} --${n}-${k}: ${d};`;
    });
    return res;
});

const htmlStyle = `
html, body {
    font-family: 'Noto Sans', 'Roboto', arial, sans-serif;
    font-size: 16px;
    font-weight: 500;
}
body {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--gray-dark);
    overflow-x: hidden;
    overflow-y: auto;
}
td, th {
    padding: 0.5rem 1rem;
}
thead th, thead td {
    border-color: var(--black);
    border-top-width: 1px;
    border-bottom-width: 1px;
    font-weight: bold;
}
tbody td {
    border-color: var(--gray-300);
    border-bottom-width: 1px;
}

a {
    color: var(--blue-700);
    line-height: 150%;
    margin-bottom: 1.5rem;
}

a:hover {
    text-decoration: underline;
}
code {
    background-color: var(--gray-200);
    padding: 0 0.25rem;
    border-radius: 0.125rem;
    font-family: courier, monospace;
}
pre code {
    all: inherit;
}
ul {
    display: block;
    margin-block-start: 0.5rem;
    margin-block-end: 0.5rem;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 2rem;
    list-style: circle;
    list-style-type: disc;
}
ol {
    display: block;
    list-style-type: decimal;
    margin-block-start: 0.5rem;
    margin-block-end: 0.5rem;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 2rem;
}
h3, h4 {
    font-weight: bold;
}
h1 {
    font-weight: normal;
    font-size: 1.5rem;
    line-height: 150%;
    margin-bottom: 1.5rem;
}
h2 {
    font-weight: bold;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    line-height: 150%;
}
h3 {
    margin-bottom: 0.5rem;
    margin-top: 2rem;
    font-size: 0.875rem;
    line-height: 150%;
}
h4, h5, h6 {
    margin-top: 1.25rem;
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    line-height: 150%;
}
p, ul > li, ol > li {
    font-size: 0.75rem;
    line-height: 150%;
    margin-bottom: 1.5rem;
}
`;

export const iframeStyle = `
:root {
${styleVariables}
}

${htmlStyle}
`;
