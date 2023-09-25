import picocolors from 'picocolors';
import { PromptObject } from 'prompts';
import { PackageManagerKindEnum } from './nextra/PackageManager.js';

const { blue } = picocolors;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write('\x1B[?25h');
    process.stdout.write('\n');
    process.exit(1);
  }
};

export const packageManagerPrompt: PromptObject = {
  onState: onPromptState,
  type: 'select',
  name: 'packageManagerChoice',
  message: 'Pick a package manager',
  choices: [
    { title: 'Npm', value: PackageManagerKindEnum.NPM },
    {
      title: 'Yarn',
      value: PackageManagerKindEnum.YARN,
    },
    { title: 'Pnpm', value: PackageManagerKindEnum.PNPM },
  ],
  initial: 0,
};

export const useNextStandalone: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useNextStandalone',
  message: `Would you like to configure ${blue(
    'Next'
  )} for standalone production builds?`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const usePrettier: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'usePrettier',
  message: `Would you like to install and configure ${blue(
    'Prettier'
  )}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useStorybook: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useStorybook',
  message: `Would you like to install and configure ${blue(
    'Storybook'
  )}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useDocker: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useDocker',
  message: `Would you like to add ${blue(
    'Docker'
  )} configuration? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useJestRTL: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useJestRTL',
  message: `Would you like to install and configure ${blue(
    'Jest'
  )} and ${`React Testing Library`}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useCypress: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useCypress',
  message: `Would you like to install and configure ${blue(
    'Cypress'
  )}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useHusky: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useHusky',
  message: `Would you like to install and configure ${blue('Git')} and ${blue(
    'Husky'
  )}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useLintStaged: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useLintStaged',
  message: `Would you like to install and configure ${blue(
    'Lint Staged'
  )}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No`,
};

export const useNextImageOptimisation: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useNextImageOptimisation',
  message: `Will you be using ${blue('Next')}'s image optimisation? `,
  initial: 'No',
  active: 'Yes',
  inactive: `No`,
};

const choices = [
  {
    title: 'classname',
    value: { module: 'classname', saveDev: false, github: '', description: '' },
  },
  {
    title: 'jotai',
    value: { module: 'jotai', saveDev: false, github: '', description: '' },
  },
  {
    title: 'zustand',
    value: { module: 'zustand', saveDev: false, github: '', description: '' },
  },
  {
    title: 'formik',
    value: { module: 'formik', saveDev: false, github: '', description: '' },
  },
  {
    title: '@reduxjs/toolkit',
    value: {
      module: '@reduxjs/toolkit',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@apollo/client graphql',
    value: {
      module: '@apollo/client graphql',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'swr',
    value: { module: 'swr', saveDev: false, github: '', description: '' },
  },
  {
    title: '@tanstack/react-query',
    value: {
      module: '@tanstack/react-query',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'react-redux',
    value: {
      module: '@tanstack/react-query',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'yup',
    value: { module: 'yup', saveDev: false, github: '', description: '' },
  },
  {
    title: 'mobx',
    value: { module: 'mobx', saveDev: false, github: '', description: '' },
  },
  {
    title: 'react-spring',
    value: {
      module: 'react-spring',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'mobx-react',
    value: {
      module: 'mobx-react',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'styled-components',
    value: {
      module: 'styled-components',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'react-hook-form',
    value: {
      module: 'react-hook-form',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'react-i18next',
    value: {
      module: 'react-i18next',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@emotion/css',
    value: {
      module: '@emotion/css',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@stripe/react-stripe-js',
    value: {
      module: '@stripe/react-stripe-js',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'react-virtualized',
    value: {
      module: 'react-virtualized',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@mui/material',
    value: {
      module: '@mui/material',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@mui/icons-material',
    value: {
      module: '@mui/icons-material',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'next-auth',
    value: { module: 'next-auth', saveDev: false, github: '', description: '' },
  },
  {
    title: 'react-toastify',
    value: {
      module: 'react-toastify',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@svgr/core',
    value: {
      module: '@svgr/core',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: '@tanstack/react-query-devtools',
    value: {
      module: '@tanstack/react-query-devtools',
      saveDev: false,
      github: '',
      description: '',
    },
  },
  {
    title: 'recharts',
    value: { module: 'recharts', saveDev: false, github: '', description: '' },
  },
];

export const useSelectedDependencies: PromptObject = {
  onState: onPromptState,
  type: 'multiselect',
  name: 'useSelectedDependencies',
  message: 'Install some popular packages?',
  choices: choices,
  hint: '- Space to select. Return to submit',
};

export default {
  packageManagerPrompt,
  useCypress,
  useDocker,
  useHusky,
  useNextImageOptimisation,
  useJestRTL,
  useLintStaged,
  useNextStandalone,
  usePrettier,
  useSelectedDependencies,
  useStorybook,
};
