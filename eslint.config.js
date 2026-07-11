export default [
  { ignores: ['node_modules/**', 'release/**', 'apps/desktop/dist/**', 'apps/desktop/dist-electron/**'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
    rules: { 'no-restricted-syntax': ['error', { selector: 'ImportDeclaration[source.value=/^.*$/] + TryStatement', message: 'Never wrap imports in try/catch blocks.' }] }
  }
];
