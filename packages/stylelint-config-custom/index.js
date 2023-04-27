module.exports = {
    extends: ['stylelint-config-standard'],
    rules: {
        'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep', 'deep'] }],
        'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['deep'] }],
        indentation: [4, { baseIndentLevel: 0 }],
        'declaration-empty-line-before': null,
        'at-rule-no-unknown': [true, { ignoreAtRules: ['define-mixin', 'mixin', 'at', 'screen', 'tailwind'] }],
        'rule-empty-line-before': null,
        'selector-list-comma-newline-after': null,
        'function-calc-no-invalid': null,
        'no-descending-specificity': null,
        'property-no-unknown': [true, { ignoreProperties: [/\$(.+?)/] }],
    },
};