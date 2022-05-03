export const getTextHighlightRegex = (term?: string) => {
    let regex = '';
    if (term) {
        // remove spaces in the search term
        const text = term.replace(/\s/g, '');
        for (let i = 0; i < text.length; i++) {
            regex += text[i];
            // add space regex after every single character to find matching keywords ignoring spaces
            if (i < text.length - 1) regex += '\\s*';
        }
    }
    return new RegExp(regex, 'i');
};
