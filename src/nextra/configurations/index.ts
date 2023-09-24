import cleanUp from './cleanUp.js';
import cypress from './cypress.js';
import docker from './docker.js';
import envVars from './envVars.js';
import gitHusky from './gitHusky.js';
import jestRTL from './jestRTL.js';
import lintStaged from './lintStaged.js';
import next from './next.js';
import prettier from './prettier.js';
import selectedDependencies from './selectedDependencies.js';
import storybook from './storybook.js';
import createNextApp from './createNextApp.js';
export * from './createNextApp.js';

export default {
  cleanUp,
  cypress,
  docker,
  envVars,
  gitHusky,
  jestRTL,
  lintStaged,
  next,
  prettier,
  selectedDependencies,
  storybook,
  createNextApp,
};
