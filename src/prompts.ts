import picocolors from 'picocolors';
import prompts from 'prompts';
import { onPromptState } from './functions.js';

const { green, blue, red, cyan, gray } = picocolors;

export const installDashboardPrompt = (projectName: string) =>
  prompts({
    onState: onPromptState,
    type: 'toggle',
    name: 'installDashboard',
    message: `Would you like to install the ${blue('baseline dashboard')}?
  
This script will:

🔧 Install the latest version of Next JS into ${cyan(
      projectName
    )} with the following config:

Typescript: ${green('yes')}
use npm: ${green('yes')}
tailwind: ${red('no')}
eslint: ${green('yes')}
src directory: ${green('yes')}
import-alias: ${blue('default')} ${gray('"@/*"')}

🔧 Configure Typescript
🔧 Configure ESLint
🔧 Install and configure Prettier
🔧 Init git
🔧 Install and configure husky pre-commit hooks
🔧 Install and configure Jest and React Testing Library
🔧 Configure a baseline dashboard app 

All configurations are based on QuantSpark standards

Do you wish to proceed?`,
    initial: 'Yes',
    active: 'Yes',
    inactive: 'No',
  });

export const configurationPrompts = () =>
  prompts([
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useYarn',
      message: `Would you like next to use ${blue('Yarn')}?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No use ${blue('npm')}`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useNextAppRouter',
      message: `Would you like next to use ${blue('App Router')}?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: 'No',
    },
  ]);
