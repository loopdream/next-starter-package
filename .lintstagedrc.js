export default {
  // Lint & Prettify TS and JS files
  '**/*.(ts|tsx|js)': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')}`,
    `tsc --noEmit`,
    `leasot ${filenames.join(' ')} --exit-nicely`,
  ],

  '**/*.(md, yml, yaml, json)': (filenames) =>
    `prettier --write ${filenames.join(' ')}`,
};
