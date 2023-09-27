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

export type ChoiceValuesType = {
  module: string;
  saveDev: boolean;
  github: string;
  description: string;
};

export interface ChoiceType {
  title: string;
  value: ChoiceValuesType;
}

export const choices: ChoiceType[] = [
  {
    title: 'classnames',
    value: {
      module: 'classnames',
      saveDev: false,
      github: 'https://github.com/JedWatson/classnames',
      description:
        'A simple JavaScript utility for conditionally joining classNames together',
    },
  },
  {
    title: 'clsx',
    value: {
      module: 'clsx',
      saveDev: false,
      github: 'https://github.com/lukeed/clsx',
      description: `A tiny (234B) utility for constructing className strings conditionally. Also serves as a faster & smaller drop-in replacement for the classnames module`,
    },
  },
  {
    title: 'jotai',
    value: {
      module: 'jotai',
      saveDev: false,
      github: 'https://github.com/pmndrs/jotai',
      description: 'Primitive and flexible state management for React',
    },
  },
  {
    title: 'zustand',
    value: {
      module: 'zustand',
      saveDev: false,
      github: 'https://github.com/pmndrs/zustand',
      description:
        'A small, fast and scalable bearbones state-management solution using simplified flux principles. ',
    },
  },
  {
    title: 'formik',
    value: {
      module: 'formik',
      saveDev: false,
      github: 'https://github.com/jaredpalmer/formik',
      description: 'Build forms in React, without the tears.',
    },
  },
  {
    title: '@reduxjs/toolkit',
    value: {
      module: '@reduxjs/toolkit',
      saveDev: false,
      github: 'https://github.com/reduxjs/redux-toolkit',
      description:
        'The official, opinionated, batteries-included toolset for efficient Redux development',
    },
  },
  {
    title: 'graphql',
    value: {
      module: 'graphql',
      saveDev: false,
      github: 'https://www.npmjs.com/package/graphql',
      description:
        'The JavaScript reference implementation for GraphQL, a query language for APIs created by Facebook. ',
    },
  },
  {
    title: '@apollo/client',
    value: {
      module: '@apollo/client',
      saveDev: false,
      github: 'https://github.com/apollographql/apollo-client',
      description:
        'Apollo Client is a fully-featured caching GraphQL client with integrations for React, Angular, and more. ',
    },
  },
  {
    title: 'swr',
    value: {
      module: 'swr',
      saveDev: false,
      github: 'https://github.com/vercel/swr',
      description: 'SWR is a React Hooks library for data fetching.',
    },
  },
  {
    title: '@tanstack/react-query',
    value: {
      module: '@tanstack/react-query',
      saveDev: false,
      github: 'https://github.com/TanStack/query',
      description:
        'Powerful asynchronous state management for TS/JS, React, Solid, Vue and Svelte',
    },
  },
  {
    title: 'react-redux',
    value: {
      module: '@tanstack/react-query',
      saveDev: false,
      github: '',
      description: 'Official React bindings for Redux.',
    },
  },
  {
    title: 'yup',
    value: {
      module: 'yup',
      saveDev: false,
      github: 'https://github.com/jquense/yup',
      description:
        'Yup is a schema builder for runtime value parsing and validation.',
    },
  },
  {
    title: 'mobx',
    value: {
      module: 'mobx',
      saveDev: false,
      github: 'https://github.com/mobxjs/mobx',
      description: 'Simple, scalable state management.',
    },
  },
  {
    title: 'react-spring',
    value: {
      module: 'react-spring',
      saveDev: false,
      github: 'https://github.com/pmndrs/react-spring',
      description: `A spring-physics first animation library giving you flexible tools to confidently cast your ideas`,
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
      github: 'https://github.com/react-hook-form/react-hook-form',
      description:
        'Performant, flexible and extensible forms with easy-to-use validation',
    },
  },
  {
    title: 'react-i18next',
    value: {
      module: 'react-i18next',
      saveDev: false,
      github: 'https://github.com/i18next/react-i18next',
      description:
        'Internationalization for react done right. Using the i18next i18n ecosystem.',
    },
  },
  {
    title: '@emotion/css',
    value: {
      module: '@emotion/css',
      saveDev: false,
      github: 'https://github.com/emotion-js/emotion',
      description: 'The Next Generation of CSS-in-JS.',
    },
  },
  {
    title: '@stripe/react-stripe-js',
    value: {
      module: '@stripe/react-stripe-js',
      saveDev: false,
      github: 'https://github.com/stripe/react-stripe-js',
      description: 'React components for Stripe.js and Stripe Elements',
    },
  },
  {
    title: '@stripe/stripe-js',
    value: {
      module: '@stripe/stripe-js',
      saveDev: false,
      github: 'https://github.com/stripe/stripe-js',
      description: 'Use Stripe.js as an ES module.',
    },
  },

  {
    title: 'react-virtualized',
    value: {
      module: 'react-virtualized',
      saveDev: false,
      github: 'https://github.com/bvaughn/react-virtualized',
      description:
        'React components for efficiently rendering large lists and tabular data.',
    },
  },
  {
    title: '@mui/material',
    value: {
      module: '@mui/material',
      saveDev: false,
      github: 'https://github.com/mui/material-ui',
      description: `Material UI is a comprehensive library of components that features our implementation of Google's Material Design system.`,
    },
  },
  {
    title: '@mui/icons-material',
    value: {
      module: '@mui/icons-material',
      saveDev: false,
      github: 'https://github.com/mui/material-ui',
      description:
        'This package provides the Google Material Icons converted to SvgIcon components.',
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
      github: 'https://github.com/nextauthjs/next-auth',
      description:
        'NextAuth.js is a complete open source authentication solution for Next.js applications.',
    },
  },
  {
    title: '@svgr/core',
    value: {
      module: '@svgr/core',
      saveDev: false,
      github: 'https://github.com/gregberge/svgr',
      description: 'Transform SVG into React Components.',
    },
  },
  {
    title: '@tanstack/react-query-devtools',
    value: {
      module: '@tanstack/react-query-devtools',
      saveDev: true,
      github: 'https://github.com/TanStack/query',
      description:
        'Developer tools to interact with and visualize the TanStack/react-query cache',
    },
  },
  {
    title: 'recharts',
    value: {
      module: 'recharts',
      saveDev: false,
      github: 'https://github.com/recharts/recharts',
      description:
        'Recharts is a Redefined chart library built with React and D3.',
    },
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
