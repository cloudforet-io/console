module.exports = {
    env: {
        browser: true,
        node: true,
    },

    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/base',
        'plugin:vue/vue3-recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'airbnb',
    ],

    rules: {
        // vue
        'vue/component-name-in-template-casing': ['error', 'kebab-case'],
        'vue/valid-v-slot': ['error', { allowModifiers: true }],
        'vue/html-indent': ['error', 4],
        'vue/first-attribute-linebreak': ['off'],
        'vue/max-attributes-per-line': 1,
        'vue/no-v-html': 0,
        'vue/no-mutating-props': 1,
        'vue/multi-word-component-names': 0,

        // js
        'max-len': ['error', { code: 200 }],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-unsafe-optional-chaining': 1,
        'no-undef': 0,
        'no-unused-vars': ['off'],
        'no-mixed-operators': 0,
        'no-promise-executor-return': 1,
        'no-multiple-empty-lines': 0,
        'prefer-regex-literals': ['off'],
        'prefer-const': 1,

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
        'no-shadow': ['off'],
        'no-use-before-define': ['off'],
        'space-before-blocks': 'off',

        // typescript rules
        '@typescript-eslint/space-before-blocks': 'error',
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
        '@typescript-eslint/camelcase': ['off'],
        '@typescript-eslint/naming-convention': [
            'off',
            {
                selector: 'variable',
                format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                filter: {
                    regex: '(total_count)',
                    match: false,
                },
                leadingUnderscore: 'allow',
            },
            {
                selector: 'memberLike',
                format: ['camelCase', 'snake_case', 'PascalCase', 'UPPER_CASE'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'parameter',
                format: ['camelCase'],
                leadingUnderscore: 'allow',
            },
            {
                selector: 'typeLike',
                format: ['PascalCase', 'UPPER_CASE'],
            },
        ],
        '@typescript-eslint/no-empty-function': ['off'], // use eslint no-empty-function rule
        '@typescript-eslint/no-use-before-define': ['off'], // use eslint no-use-before-define rule
        '@typescript-eslint/ban-ts-ignore': ['off'],
        '@typescript-eslint/explicit-function-return-type': ['off'],
        '@typescript-eslint/explicit-module-boundary-types': ['off'],
        '@typescript-eslint/no-explicit-any': ['off'],
        '@typescript-eslint/no-unused-vars': ['error'],
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/consistent-type-imports': ['error'],

        semi: 'off',
        '@typescript-eslint/semi': ['error'],

        // core-lib as a package
        'default-param-last': ['off'],
        'no-redeclare': ['off'],
        'max-classes-per-file': ['off'],

        // eslint-plugin-import rules
        'import/namespace': [0, { allowComputed: true }],
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaVersion: 'latest',
    },

    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts'],
        },
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
