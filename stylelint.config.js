module.exports = {
    // extends: 'stylelint-config-recommended-scss',
    rules: {
        'selector-pseudo-element-no-unknown': [
            true,
            {
                ignorePseudoElements: ['v-deep'],
            },
        ],
    },
};
