export default {
  '**/*.[jt]s': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
    `eslint --fix ${filenames.join(' ')}`,
    `node --experimental-vm-modules --no-warnings node_modules/.bin/jest --ci --passWithNoTests --findRelatedTests ${filenames.join(
      ' '
    )}`,
    `tsc --noEmit`,
  ],

  '**/*.(md, yml, yaml, json)': (filenames) => [
    `prettier --write ${filenames.join(' ')}`,
  ],
};
