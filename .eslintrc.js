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
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],

    rules: {
        'vue/component-name-in-template-casing': ['error', 'kebab-case'],
        'vue/valid-v-slot': ['error', { allowModifiers: true }],
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
        'no-shadow': ['off'],
        'no-use-before-define': ['off'],

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
        '@typescript-eslint/camelcase': ['off'],
        '@typescript-eslint/naming-convention': [
            // FIXME:: turn on naming-convention
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

        // eslint-plugin-import rules
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'index'],
                pathGroups: [
                    {
                        pattern: '@vue/test-utils',
                        group: 'builtin',
                        position: 'before',
                    },
                    {
                        pattern: '{@vue*,@vue*/**,vue*,vue*/**}',
                        group: 'builtin',
                        position: 'before',
                    },
                    {
                        pattern: '{@spaceone/design-system/**}',
                        group: 'external',
                        position: 'after',
                    },
                    {
                        pattern: '@cloudforet/**',
                        group: 'internal',
                        position: 'before',
                    },
                    {
                        pattern: '@/router/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: '@/store/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: '@/translations/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: '@/lib/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: '@/common/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: '@/styles/**',
                        group: 'internal',
                        position: 'after',
                    },
                    {
                        pattern: '@/services/**',
                        group: 'internal',
                        position: 'after',
                    },
                ],
                pathGroupsExcludedImportTypes: ['@vue/test-utils'],
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true,
                },
                'newlines-between': 'always',
            },
        ],
        'import/namespace': [0, { allowComputed: true }],
    },
    ignorePatterns: ['src/assets/**', '**/node_modules/**', 'packages/cloudforet/language-pack/**', 'public/lottie.js'],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaVersion: 2018,
    },

    settings: {
        'import/resolver': {
            typescript: {},
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts'],
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
