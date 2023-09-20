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
    { title: 'classname', value: { module: 'classname' } },
    { title: 'jotai', value: { module: 'jotai' } },
    { title: 'zustand', value: { module: 'zustand' } },
    { title: 'formik', value: { module: 'formik' } },
    { title: '@reduxjs/toolkit', value: { module: '@reduxjs/toolkit' } },
    {
      title: '@apollo/client graphql',
      value: { module: '@apollo/client graphql' },
    },
    { title: 'swr', value: { module: 'swr' } },
    {
      title: '@tanstack/react-query',
      value: { module: '@tanstack/react-query' },
    },
    { title: 'react-redux', value: { module: '@tanstack/react-query' } },
    { title: 'yup', value: { module: 'yup' } },
    { title: 'mobx', value: { module: 'mobx' } },
    { title: 'react-spring', value: { module: 'react-spring' } },
    { title: 'mobx-react', value: { module: 'mobx-react' } },
    { title: 'styled-components', value: { module: 'styled-components' } },
    { title: 'react-hook-form', value: { module: 'react-hook-form' } },
    { title: 'react-i18next', value: { module: 'react-i18next' } },
    { title: '@emotion/css', value: { module: '@emotion/css' } },
    {
      title: '@stripe/react-stripe-js',
      value: { module: '@stripe/react-stripe-js' },
    },
    { title: 'react-virtualized', value: { module: 'react-virtualized' } },
    { title: '@mui/material', value: { module: '@mui/material' } },
    { title: '@mui/icons-material', value: { module: '@mui/icons-material' } },
    { title: 'next-auth', value: { module: 'next-auth' } },
    { title: 'react-toastify', value: { module: 'react-toastify' } },
    { title: '@svgr/core', value: { module: '@svgr/core' } },
    {
      title: '@tanstack/react-query-devtools',
      value: { module: '@tanstack/react-query-devtools' },
    },
    { title: 'recharts', value: { module: 'recharts' } },
  ],
  hint: '- Space to select. Return to submit',
};
