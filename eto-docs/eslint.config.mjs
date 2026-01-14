import next from '@next/eslint-plugin-next';

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      '.source/**',
      'next-env.d.ts',
    ],
  },
  {
    ...next.configs['core-web-vitals'],
  },
];