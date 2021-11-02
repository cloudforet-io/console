module.exports = {
    root: true,

    env: {
        node: true,
    },

    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/recommended',
        '@vue/airbnb',
        '@vue/typescript',
    ],

    rules: {
        'vue/component-name-in-template-casing': ['error', 'kebab-case'],
        'max-len': ['error', { code: 200 }],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'vue/html-indent': ['error', 4],
        indent: ['error', 4],
        'prefer-destructuring': ['error', { object: false, array: false }],
        radix: ['error', 'as-needed'],
        'no-prototype-builtins': 'error',
        'no-empty': ['error', { allowEmptyCatch: true }],
        'import/extensions': [
            'error',
            'always',
            {
                js: 'never',
                jsx: 'never',
                ts: 'never',
                tsx: 'never',
            },
        ],
        camelcase: 'off',
        'vue/max-attributes-per-line': [
            'error',
            {
                singleline: 3,
                multiline: {
                    max: 3,
                    allowFirstLine: true,
                },
            },
        ],
        'no-this-before-super': ['off'],
        'no-useless-constructor': ['off'],
        'no-empty-function': ['error', { allow: ['constructors', 'arrowFunctions'] }],
        'no-param-reassign': ['error', { props: false }],
        'no-underscore-dangle': ['off'],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: true,
            },
        ],
        'import/prefer-default-export': ['off'],
        'no-new': ['off'],
        'prefer-template': ['error'],
        'no-plusplus': ['off'],
        'no-tabs': ['off'],

        // typescript rules
        '@typescript-eslint/explicit-member-accessibility': [
            'error',
            {
                accessibility: 'no-public',
                overrides: {
                    accessors: 'no-public',
                    methods: 'no-public',
                    properties: 'no-public',
                    parameterProperties: 'explicit',
                },
            },
        ],
        '@typescript-eslint/no-object-literal-type-assertion': ['off'],
        '@typescript-eslint/no-parameter-properties': [
            'error',
            { allows: ['protected', 'public'] },
        ],
        '@typescript-eslint/camelcase': ['error', {
            properties: 'never',
            allow: [
                '_id$',
                '_at$',
                'total_count',
            ],
        },
        ],
        '@typescript-eslint/no-empty-function': ['off'], // use eslint no-empty-function rule
        '@typescript-eslint/no-use-before-define': ['off'], // use eslint no-use-before-define rule
        '@typescript-eslint/ban-ts-ignore': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/no-explicit-any': ['off']
    },
    ignorePatterns: ['src/assets/**', '**/node_modules/**', 'translations/language-pack/**', 'public/lottie.js'],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaVersion: 2018,
    },

    settings: {
        'import/resolver': {
            typescript: {},
        },
    },

    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
            env: {
                jest: true,
            },
        },
    ],
};
