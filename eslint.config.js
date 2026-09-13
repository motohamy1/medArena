// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['app/(tabs)/pearls.tsx', 'components/DailyClinicalPearls.tsx'],
    rules: {
      'react-hooks/refs': 'off',
    },
  },
  {
    files: [
      'app/admin/ReviewQueue.tsx',
      'app/specialty/[[]id[]]/[[]topic[]].tsx',
      'app/specialty/[[]id[]]/category/[[]categoryId[]].tsx',
      'app/specialty/[[]id[]]/index.tsx',
      'components/ClinicalGuide.tsx',
      'components/KnowledgeMap/KnowledgeMap.tsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['components/ScrollStack/ScrollStack.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/immutability': 'off',
    },
  },
]);
