module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/html-indent": [ "error", 4],
    'indent':['error',4]
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
  },
}
