import js from '@eslint/js'
import globals from 'globals'
import prettier from 'eslint-config-prettier'

export default [
    {
        languageOptions: {
            globals: {
                bootstrap: 'readonly',
            },
        },
    },
    {
        ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
    },
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
    },
    prettier,
]
