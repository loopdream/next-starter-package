export const PROGRAM_DESCRIPTION = `Generate a QuantSpark baseline Next.js app with best practace feature set`;

export const SCRIPT_DESCRIPTION = `\n\n${PROGRAM_DESCRIPTION}

This script will:

- Run the Next JS install script
- Set up Prettier 
- Set up ESLint
- Set up husky pre-commit hooks
- App folder structure 
\n\n`;

export const PRETTIER_CONFIG = `{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false
}`;


export const COMMANDS = {
  installNext: `npx create-next-app@latest`,
  installPrettier: `yarn add --dev prettier eslint-config-prettier`
}

export const LOG_MESSAGES = {
  'nextJs': `1. Running Next install script: npx create-next-app@latest \n\n Installing into directory: `,
  'nextJsError': `Error creating Next.js app:`, 
  'vsCodeSettings': `

    It is recommended you set VSCode to auto-fix eslint errors on save:

    // .vscode/settings.json
    {
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
      }
    }
    
    `,
    'esLintPrettierError': `Error setting up eslint and prettier:`, 
}