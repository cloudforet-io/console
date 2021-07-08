module.exports = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2018
    },
    plugins: [
        '@typescript-eslint'
    ],
    env: {
        browser: true,
        es6: true,
        node: true
    },
    globals: {
    },
    rules: {
        'indent': ['error', 4, {
            'ObjectExpression': 1,
            'flatTernaryExpressions': true,
            'ignoreComments': true,
            'ArrayExpression': 1
        }],
        'quotes': ['error', 'single'],
        'comma-dangle': ['error', {
            'arrays': 'never',
            'objects': 'never',
            'imports': 'never',
            'exports': 'never',
            'functions': 'never'
        }],
        'no-irregular-whitespace': ['error', {'skipComments': true}],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'max-len': ['error', { code: 200 }],
        'no-empty': 'error',
        'no-duplicate-imports': 'error',
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'semi': ['error', 'always'],
        // typescript rules
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
                overrides: {
                    accessors: 'no-public',
                    methods: 'no-public',
                    properties: 'no-public',
                    parameterProperties: 'explicit'
                }
            }
        ],
        '@typescript-eslint/no-object-literal-type-assertion': ['off'],
        '@typescript-eslint/no-parameter-properties': [
            'error',
            { allows: ['protected', 'public'] }
        ],
        '@typescript-eslint/camelcase': ['off'], // use eslint camelcase rule
        '@typescript-eslint/no-empty-function': ['off'], // use eslint no-empty-function rule
        '@typescript-eslint/no-use-before-define': ['off'], // use eslint no-use-before-define rule
        '@typescript-eslint/ban-ts-ignore': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off']
    }
};
