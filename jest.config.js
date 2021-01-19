
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { resolve } = require('path');

module.exports = {
    preset: 'ts-jest',
    globals: {
        'vue-jest': {
            tsConfig: resolve('tsconfig.json'),
        },
    },
    moduleFileExtensions: [
        'js',
        'ts',
        'jsx',
        'json',
        'vue',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^vue$': 'vue/dist/vue.common.js',
    },
    modulePathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/build/',
        '<rootDir>/dist/',
    ],
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.ts?$': 'babel-jest',
        '^.+\\.tsx?$': 'babel-jest',
        '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    },
    snapshotSerializers: [
        'jest-serializer-vue',
    ],
};
