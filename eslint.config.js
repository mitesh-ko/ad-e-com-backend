const eslintConfig = [
    {
        ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'uploads/**'],
    },
    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2021, // same as es2021
                sourceType: 'script', // 'module' if you use ESM imports/exports
            },
            globals: {
                // Globals available in Node.js
                process: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
            },
        },
        rules: {
            quotes: ['warn', 'single', {avoidEscape: true}],
            indent: ['warn', 4],
            'object-curly-spacing': ['warn', 'never'],
        },
    }
];

export default eslintConfig;