module.exports = {
    root: false,
    extends: ["custom"],

    rules: {
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
    },
    ignorePatterns: ['src/assets/**', '**/node_modules/**', 'public/lottie.js'],
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts'],
        },
        'import/resolver': {
            typescript: {},
        },
    },
};
