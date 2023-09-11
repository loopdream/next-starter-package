export const PROGRAM_DESCRIPTION = `Generate a QuantSpark baseline Next.js app with best practace feature set`;

export const SCRIPT_DESCRIPTION = `\n\n${PROGRAM_DESCRIPTION}

This script will:

- Run the Next JS install script
- Set up Prettier 
- Set up ESLint
- Set up husky pre-commit hooks
- App folder structure 
\n\n`;

const EMOJIS = {
  alert: `⚠️`,
  spanner: `🔧`,
  done: `✅`,
};

export const MESSAGES = {
  nextJs: {
    install: `${EMOJIS.spanner} 1. Running Next install script: npx create-next-app@latest \n\n Installing into directory: `,
    error: `\n${EMOJIS.alert} Error creating Next.js app:`,
  },
  esLintPrettier: {
    install: `\n${EMOJIS.spanner} 2.1 Installing @typescript-eslint/eslint-plugin prettier eslint-config-prettier...\n\n`,
    eslintrc: `\n${EMOJIS.spanner} 2.2 Configuring eslintrc...`,
    prettierrc: `\n${EMOJIS.spanner} 2.2 Configuring prettier...`,
    error: `\n${EMOJIS.alert} Error setting up eslint and prettier:`,
  },
  done: `\n✅ Done\n\n`,
  vsCodeSettings: `

  It is recommended you set VSCode to auto-fix eslint errors on save:

  // .vscode/settings.json
  {
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  }
  
  `,
};
