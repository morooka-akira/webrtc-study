module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: { browser: true, node: true, es6: true },
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    // return typeを強制しない 理由: 推論使いたいから
    '@typescript-eslint/explicit-function-return-type': 'off',
    // NOTE: まずは、導入として any を許可
    '@typescript-eslint/no-explicit-any': 'off',
    // 変数の未使用を許可しない
    'no-unused-vars': 'error',
    'prettier/prettier': [
      'error',
      {
        printWidth: 120,
        singleQuote: true,
        semi: false,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
  },
}
