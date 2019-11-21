module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
  rules: {
    'max-len': ['error', { "code": 200 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/html-indent": [ "error", 4],
    'indent':['error',4],
    'prefer-destructuring': ["error", {"object": false, "array": false}],
    'radix': ["error", "as-needed"],
    'no-prototype-builtins': "error",
    'no-empty': ["error", { "allowEmptyCatch": true }],
     'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    'camelcase': ["error", { "properties": "always" }],
    'vue/max-attributes-per-line': ["error", {
      'singleline': 3,
      'multiline': {
        "max": 3,
        "allowFirstLine": true
      },
    }],
    "no-param-reassign": ["error", { "props": false }],
    "no-underscore-dangle": ["off"],
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
  },
}
