module.exports = {
    extends: 'stylelint-config-standard',
    rules: {
        'selector-pseudo-element-no-unknown': [true, { ignorePseudoElements: ['v-deep'] }],
        indentation: ['always', { baseIndentLevel: 4 }],
        'declaration-empty-line-before': false,
        'selector-nested-pattern': true,
        'at-rule-no-unknown': [true, { ignoreAtRules: ['define-mixin', 'mixin', 'at', 'screen', 'tailwind'] }],
        'rule-empty-line-before': false,
        'selector-list-comma-newline-after': false,
        'function-calc-no-invalid': 'off',
    },
};
