// if additional exception words are found, must be added.
const searchInputRegex = ['[', '?', '\\', '^', '+', '$', '*', '.', '|'];

export const getTextHighlightRegex = (term?: string) => {
    let regex = '';

    if (term) {
        // remove spaces in the search term
        const text = term.replace(/\s/g, '');
        for (let i = 0; i < text.length; i++) {
            const currentIndexText = text[i];
            if (searchInputRegex.includes(currentIndexText)) {
                // add escape character in '[?\^+$*.|', because RegExp can't accept just that words.
                regex += `\\${currentIndexText}`;
            } else {
                regex += currentIndexText;
            }
            // add space regex after every single character to find matching keywords ignoring spaces
            if (i < text.length - 1) regex += '\\s*';
        }
    }
    return new RegExp(regex, 'i');
};
