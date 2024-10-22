module.exports = {
    extends: ['stylelint-config-standard'],
    rules: {
        'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep', 'deep'] }],
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep'] }],
        indentation: [4, { baseIndentLevel: 0 }], // will be deprecated in stylelint v15 (formatting will be handled by prettier)
        'declaration-empty-line-before': null,
        'at-rule-no-unknown': [true, { ignoreAtRules: ['define-mixin', 'mixin', 'at', 'screen', 'tailwind', 'container'] }],
        'rule-empty-line-before': null,
        'selector-list-comma-newline-after': null, // will be deprecated in stylelint v15 (formatting will be handled by prettier)
        'function-calc-no-invalid': null,
        'no-descending-specificity': null,
        'property-no-unknown': [true, { ignoreProperties: [/\$(.+?)/, 'container-name', 'container-type'] }],
    },
};
