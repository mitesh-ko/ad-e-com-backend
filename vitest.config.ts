import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: [
      { find: /^#src\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/$1.ts') },
      { find: /^#config\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/config/$1.ts') },
      { find: /^#constants\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/constants/$1.ts') },
      { find: /^#database\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/database/$1.ts') },
      { find: /^#errors\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/errors/$1.ts') },
      { find: /^#middlewares\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/middlewares/$1.ts') },
      { find: /^#modules\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/modules/$1.ts') },
      { find: /^#shared\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/shared/$1.ts') },
      { find: /^#types\/(.*)\.js$/, replacement: path.resolve(__dirname, './src/@types/$1.ts') },
      { find: /^#src\/(.*)$/, replacement: path.resolve(__dirname, './src/$1') },
      { find: /^#config\/(.*)$/, replacement: path.resolve(__dirname, './src/config/$1') },
      { find: /^#constants\/(.*)$/, replacement: path.resolve(__dirname, './src/constants/$1') },
      { find: /^#database\/(.*)$/, replacement: path.resolve(__dirname, './src/database/$1') },
      { find: /^#errors\/(.*)$/, replacement: path.resolve(__dirname, './src/errors/$1') },

      { find: /^#middlewares\/(.*)$/, replacement: path.resolve(__dirname, './src/middlewares/$1') },
      { find: /^#modules\/(.*)$/, replacement: path.resolve(__dirname, './src/modules/$1') },
      { find: /^#shared\/(.*)$/, replacement: path.resolve(__dirname, './src/shared/$1') },
      { find: /^#types\/(.*)$/, replacement: path.resolve(__dirname, './src/@types/$1') },
    ],
  },
});

