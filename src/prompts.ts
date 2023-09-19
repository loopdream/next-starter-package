import picocolors from 'picocolors';
import { PromptObject } from 'prompts';
import { onPromptState } from './functions/utils.js';

const { blue } = picocolors;

export const packageManagerPrompt: PromptObject = {
  type: 'select',
  name: 'packageManager',
  message: 'Pick a package manager',
  choices: [
    { title: 'Npm', value: 'npm' },
    {
      title: 'Yarn',
      value: 'yarn',
    },
    { title: 'Pnpm', value: 'pnpm' },
  ],
  initial: 0,
};

export const useNextStandalonePrompt: PromptObject = {
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

export const usePrettierPrompt: PromptObject = {
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

export const useStorybookPrompt: PromptObject = {
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

export const useDockerPrompt: PromptObject = {
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

export const useJestRTLPrompt: PromptObject = {
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

export const useCypressPrompt: PromptObject = {
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

export const useHuskyPrompt: PromptObject = {
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

export const useLintStagedPrompt: PromptObject = {
  onState: onPromptState,
  type: 'toggle',
  name: 'useLintStaged',
  message: `Would you like to install and configure ${blue(
    'Lint Staged'
  )}? (recommended)`,
  initial: 'Yes',
  active: 'Yes',
  inactive: `No use ${blue('npm')}`,
};

export const useSelectedDependenciesPrompt: PromptObject = {
  type: 'multiselect',
  name: 'useSelectedDependencies',
  message: 'Install some popular packages?',
  choices: [
    { title: 'classname', value: 'classname' },
    { title: 'jotai', value: 'jotai' },
    { title: 'zustand', value: 'zustand' },
    { title: 'formik', value: 'formik' },
    { title: '@reduxjs/toolkit', value: '@reduxjs/toolkit' },
    { title: '@apollo/client graphql', value: '@apollo/client graphql' },
    { title: 'swr', value: 'swr' },
    { title: '@tanstack/react-query', value: '@tanstack/react-query' },
    { title: 'react-redux', value: '@tanstack/react-query' },
    { title: 'yup', value: 'yup' },
    { title: 'mobx', value: 'mobx' },
    { title: 'react-spring', value: 'react-spring' },
    { title: 'mobx-react', value: 'mobx-react' },
  ],
  hint: '- Space to select. Return to submit',
};
