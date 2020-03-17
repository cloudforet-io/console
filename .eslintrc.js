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
    'max-len': ['error', { "code": 200 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/html-indent": [ "error", 4],
    'indent':['error',4],
    'prefer-destructuring': ["error", {"object": false, "array": false}],
    'radix': ["error", "as-needed"],
    'no-prototype-builtins': "error",
    'no-empty': ["error", { "allowEmptyCatch": true }],
     'import/extensions': ['error', 'always',
       {
         "js": "never",
         "jsx": "never",
         "ts": "never",
         "tsx": "never"
    }],
    'camelcase': ["error", { "properties": "always", "allow": [
        "domain_id", "item_type", "region_id"
      ]}],
    'vue/max-attributes-per-line': ["error", {
      'singleline': 3,
      'multiline': {
        "max": 3,
        "allowFirstLine": true
      },
    }],
    "no-this-before-super":["off"],
    "no-useless-constructor":["off"],
    "no-empty-function":["error", { "allow": ["constructors"] }],
    "no-param-reassign": ["error", { "props": false }],
    "no-underscore-dangle": ["off"],
    "import/no-extraneous-dependencies": ["error", {
      "devDependencies": true,
    }],
    "import/prefer-default-export":["off"],
    'no-new': ['off'],

    // typescript rules
    '@typescript-eslint/explicit-member-accessibility': ["error", {
      accessibility: 'explicit',
      overrides: {
        accessors: 'no-public',
        methods: 'explicit',
        properties: 'explicit',
        parameterProperties: 'explicit'
      }
    }]
    },
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2018,
  },
}
