module.exports = {
  root: true,
  extends: [
    'standard',
    'plugin:vue/recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: [
    'html',
    'standard',
    'vue'
  ],
  env: {
    browser: true,
    jquery: true
  },
  globals: {
    "$": true,
    "jQuery": true,

  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/max-attributes-per-line': ['off', {
      'singleline': 1,
      'multiline': {
        'max': 1,
        'allowFirstLine': false
      }
    }],
  }
}
