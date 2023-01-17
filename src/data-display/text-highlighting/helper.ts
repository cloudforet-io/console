import { escapeRegExp } from 'lodash';

export const getTextHighlightRegex = (term?: string|number) => {
    let regex = '';
    if (typeof term === 'string') {
        // remove spaces in the search term
        const text = term.replace(/\s/g, '');
        for (let i = 0; i < text.length; i++) {
            regex += text[i];
            // add space regex after every single character to find matching keywords ignoring spaces
            if (i < text.length - 1) regex += '\\s*';
        }
    } else if (typeof term === 'number') {
        regex = `${term}`;
    }
    return new RegExp(escapeRegExp(regex), 'i');
};
