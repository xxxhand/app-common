module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: "airbnb",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  rules: {
    "no-var": "error",
    "no-tabs": "off",
    "import/prefer-default-export": "off",
    "comma-dangle": 'off',
    "no-await-in-loop": "off",
    "no-console": "off",
    "max-len": [
      "error",
      {
        code: 180,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignorePattern: "^import\\s.+\\sfrom\\s.+;$",
      },
    ],
    "no-bitwise": "off",
    "no-empty": "error",
    "no-eval": "error",
    "no-inline-comments": "off",
    "no-const-assign": "error",
    "no-underscore-dangle": "off",
    "object-curly-newline": "off",
    semi: ["error", "always"],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "no-restricted-syntax": [
      "error",
      {
        selector: "ForInStatement",
        message:
          "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.",
      },
      {
        selector: "LabeledStatement",
        message: "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.",
      },
      {
        selector: "WithStatement",
        message: "`with` is disallowed in strict mode because it makes code impossible to predict and optimize.",
      },
    ],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
  },
  globals: {
    document: false,
    describe: "readonly",
    beforeAll: "readonly",
    afterAll: "readonly",
    test: "readonly",
    expect: "readonly",
    beforeEach: "readonly",
    afterEach: "readonly",
  },
};
