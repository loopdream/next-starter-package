export default {
  '**/*.[jt]s': (filenames) => [
    `prettier --check ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
    `eslint ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')}`,
    `node --experimental-vm-modules --no-warnings node_modules/.bin/jest --passWithNoTests --findRelatedTests ${filenames.join(
      ' '
    )}`,
    `tsc --noEmit`,
  ],

  '**/*.(md, yml, yaml, json)': (filenames) => [
    `prettier --check ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],
};
