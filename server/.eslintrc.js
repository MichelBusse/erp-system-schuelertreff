module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
    'prettier/prettier': 'warn',
    'simple-import-sort/exports': 'off',
    'simple-import-sort/imports': [
      'off',
      {
        groups: [
          // Side effect imports
          ['^\\u0000'],
          // Packages
          ['^@?\\w'],
          // Absolute imports and anything not matched in another group
          ['^(src/)?'],
          // Relative imports
          ['^\\.'],
        ],
      },
    ],
  },
}
