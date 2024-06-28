module.exports = {
  parser: '@babel/eslint-parser',
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
    requireConfigFile: false,
  },
  plugins: [
    'react',
  ],
  rules: {
    "react/prop-types": "off",
    "no-console": "off",
    "no-undef": "off",
    "no-unused-vars": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "react/jsx-uses-vars": "off",
    "react/no-unescaped-entities": "off",
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
};
