import picocolors from 'picocolors';
import { PromptObject } from 'prompts';
import { onPromptState } from './utils/index.js';

const { blue } = picocolors;

export const packageManagerPrompt: PromptObject = {
  type: 'select',
  name: 'packageManagerChoice',
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
    { title: 'classname', value: { module: 'classname', saveDev: false } },
    { title: 'jotai', value: { module: 'jotai', saveDev: false } },
    { title: 'zustand', value: { module: 'zustand', saveDev: false } },
    { title: 'formik', value: { module: 'formik', saveDev: false } },
    {
      title: '@reduxjs/toolkit',
      value: { module: '@reduxjs/toolkit', saveDev: false },
    },
    {
      title: '@apollo/client graphql',
      value: { module: '@apollo/client graphql' },
    },
    { title: 'swr', value: { module: 'swr', saveDev: false } },
    {
      title: '@tanstack/react-query',
      value: { module: '@tanstack/react-query' },
    },
    {
      title: 'react-redux',
      value: { module: '@tanstack/react-query', saveDev: false },
    },
    { title: 'yup', value: { module: 'yup', saveDev: false } },
    { title: 'mobx', value: { module: 'mobx', saveDev: false } },
    {
      title: 'react-spring',
      value: { module: 'react-spring', saveDev: false },
    },
    { title: 'mobx-react', value: { module: 'mobx-react', saveDev: false } },
    {
      title: 'styled-components',
      value: { module: 'styled-components', saveDev: false },
    },
    {
      title: 'react-hook-form',
      value: { module: 'react-hook-form', saveDev: false },
    },
    {
      title: 'react-i18next',
      value: { module: 'react-i18next', saveDev: false },
    },
    {
      title: '@emotion/css',
      value: { module: '@emotion/css', saveDev: false },
    },
    {
      title: '@stripe/react-stripe-js',
      value: { module: '@stripe/react-stripe-js' },
    },
    {
      title: 'react-virtualized',
      value: { module: 'react-virtualized', saveDev: false },
    },
    {
      title: '@mui/material',
      value: { module: '@mui/material', saveDev: false },
    },
    {
      title: '@mui/icons-material',
      value: { module: '@mui/icons-material', saveDev: false },
    },
    { title: 'next-auth', value: { module: 'next-auth', saveDev: false } },
    {
      title: 'react-toastify',
      value: { module: 'react-toastify', saveDev: false },
    },
    { title: '@svgr/core', value: { module: '@svgr/core', saveDev: false } },
    {
      title: '@tanstack/react-query-devtools',
      value: { module: '@tanstack/react-query-devtools' },
    },
    { title: 'recharts', value: { module: 'recharts', saveDev: false } },
  ],
  hint: '- Space to select. Return to submit',
};
