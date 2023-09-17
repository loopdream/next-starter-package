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
      `./${projectName}`
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

export const useYarnPrompt = () =>
  prompts({
    onState: onPromptState,
    type: 'toggle',
    name: 'useYarn',
    message: `Would you like next to use ${blue('Yarn')}?`,
    initial: 'Yes',
    active: 'Yes',
    inactive: `No use ${blue('npm')}`,
  });

export const configurationPrompts = () =>
  prompts([
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useNextStandalone',
      message: `Would you like to configure ${blue(
        'Next'
      )} for standalone production builds?`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'usePrettier',
      message: `Would you like to install and configure ${blue(
        'Prettier'
      )}? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useStorybook',
      message: `Would you like to install and configure ${blue(
        'Storybook'
      )}? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useDocker',
      message: `Would you like to add ${blue(
        'Docker'
      )} configuration? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useJestRTL',
      message: `Would you like to install and configure ${blue(
        'Jest'
      )} and ${`React Testing Library`}? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useCypress',
      message: `Would you like to install and configure ${blue(
        'Cypress'
      )}? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useHusky',
      message: `Would you like to install and configure ${blue(
        'Git'
      )} and ${blue('Husky')}? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No`,
    },
    {
      onState: onPromptState,
      type: 'toggle',
      name: 'useLintStaged',
      message: `Would you like to install and configure ${blue(
        'Lint Staged'
      )}? (recommended)`,
      initial: 'Yes',
      active: 'Yes',
      inactive: `No use ${blue('npm')}`,
    },
  ]);
