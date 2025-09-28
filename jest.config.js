/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }],
    '^.+\\.(js|jsx|mjs)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(msw|@mswjs|@open-draft|until-async|headers-polyfill)/)'
  ],
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/**/*.(test|spec).(ts|tsx)'
  ],
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!main.tsx',
    '!vite-env.d.ts'
  ]
};